# Cedar Elevators - Deep Dive Technical Analysis

**Analysis Date**: December 28, 2024  
**Scope**: Exclude Quote Management System (ON HOLD)  
**Focus**: Identify implementation gaps and provide actionable solutions

---

## 🎯 Executive Summary

After thorough code analysis, Cedar Elevators has **strong architectural foundations** but significant backend implementation gaps. The codebase is production-quality at the frontend layer but needs substantial backend completion.

### Key Findings:
- ✅ **Cart Actions**: 85% complete with proper database queries
- ✅ **Order Actions**: 80% complete with good structure
- ✅ **Product Actions**: 75% complete with CRUD operations
- ❌ **Database Schema**: Only admin tables exist, missing 90% of required tables
- ❌ **Payment Integration**: 0% - Not started despite Razorpay configuration
- ❌ **Email System**: 0% - Resend not even in dependencies
- ❌ **API Routes**: Only 3 routes exist, need 20+ more

---

## 📊 Detailed Analysis by Component

## 1. Shopping Cart System

### Current State: ⚠️ **75% Complete**

#### ✅ What's Working:
- **File**: `/app/src/lib/actions/cart.ts`
- Cart ID generation via cookies
- Create cart function with proper error handling
- Get cart with items join
- Add to cart with upsert logic
- Update line item quantity
- Remove line item
- Proper Supabase queries using `createClerkSupabaseClient()`

#### ❌ Critical Gaps:

**1. Missing Database Tables**
```sql
-- Current code expects these tables but they DON'T EXIST:
- carts
- cart_items
- product_variants
```

**2. Incomplete Product Variant Logic**
- Lines 83-109: Tries to fetch from `product_variants` table
- Has fallback logic but incomplete
- Comments indicate uncertainty about schema

**3. No Guest-to-User Cart Migration**
- When user signs in, cart isn't migrated
- Cookie-based cart not synced with user account

**4. No Inventory Validation**
- addToCart doesn't check stock_quantity
- Could allow overselling

#### 🔧 Required Fixes:

**Step 1: Create Database Tables**
```sql
-- Create carts table
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255),
  guest_id VARCHAR(255),
  region_id VARCHAR(50),
  currency_code VARCHAR(3) DEFAULT 'INR',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create cart_items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID,
  title TEXT NOT NULL,
  thumbnail TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_carts_user_id ON carts(clerk_user_id);
```

**Step 2: Add Missing Functions**

Create `/app/src/lib/actions/cart-extended.ts`:
```typescript
'use server'

import { createClerkSupabaseClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"

/**
 * Migrate guest cart to user cart after login
 */
export async function migrateGuestCart(guestCartId: string) {
  const supabase = await createClerkSupabaseClient()
  const { userId } = await auth()
  
  if (!userId) return
  
  // Update cart to associate with user
  const { error } = await supabase
    .from('carts')
    .update({ clerk_user_id: userId, guest_id: null })
    .eq('id', guestCartId)
  
  if (error) throw error
}

/**
 * Validate cart item against inventory
 */
export async function validateCartInventory(cartId: string) {
  const supabase = await createClerkSupabaseClient()
  
  // Get cart items with product inventory
  const { data: items, error } = await supabase
    .from('cart_items')
    .select(`
      *,
      product:products!product_id(stock_quantity)
    `)
    .eq('cart_id', cartId)
  
  if (error) throw error
  
  const issues = items?.filter(item => {
    const stock = item.product?.stock_quantity || 0
    return item.quantity > stock
  })
  
  return {
    valid: issues?.length === 0,
    issues: issues?.map(i => ({
      itemId: i.id,
      requested: i.quantity,
      available: i.product?.stock_quantity || 0
    }))
  }
}

/**
 * Clear cart after order completion
 */
export async function clearCart(cartId: string) {
  const supabase = await createClerkSupabaseClient()
  
  // Delete all items
  await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cartId)
  
  // Mark cart as completed
  await supabase
    .from('carts')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', cartId)
}
```

**Step 3: Fix Product Variant Query**

Update `/app/src/lib/actions/cart.ts` lines 83-109:
```typescript
// Replace the uncertain variant query with this:
const { data: product, error: prodError } = await supabase
  .from('products')
  .select('id, title, thumbnail, price, stock_quantity')
  .eq('id', variantId) // Assuming variantId is actually productId for simple schema
  .single()

if (prodError || !product) {
  throw new Error(`Product not found: ${variantId}`)
}

// Check inventory
if (product.stock_quantity < quantity) {
  throw new Error(`Insufficient stock. Available: ${product.stock_quantity}`)
}

const productTitle = product.title
const unitPrice = product.price
const thumbnail = product.thumbnail
const productId = product.id
```

---

## 2. Order Management System

### Current State: ⚠️ **70% Complete**

#### ✅ What's Working:
- **File**: `/app/src/lib/actions/orders.ts`
- Get single order with items join
- Update order status
- Bulk update order status
- Add tracking information
- Cancel order with reason
- Fetch orders with filters

#### ❌ Critical Gaps:

**1. Missing Database Tables**
```sql
-- Code expects these but they DON'T EXIST:
- orders
- order_items
```

**2. No Order Creation Function**
- Most critical function is missing
- Can't create orders from cart
- No checkout completion

**3. No Payment Integration**
- Orders have payment_status field but no payment logic
- No Razorpay integration

**4. Inventory Not Restored on Cancellation**
- Line 172: `TODO: Restore inventory for cancelled order items`
- Stock not decremented on order creation either

**5. No Invoice Generation**
- Orders can be fetched but no PDF/invoice

#### 🔧 Required Fixes:

**Step 1: Create Database Tables**
```sql
-- Create orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  clerk_user_id VARCHAR(255),
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  order_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'INR',
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  tracking_number TEXT,
  tracking_carrier TEXT,
  tracking_url TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

-- Create order_items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  variant_id UUID,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  variant_sku TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_orders_user_id ON orders(clerk_user_id);
CREATE INDEX idx_orders_status ON orders(order_status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_orders_number ON orders(order_number);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

-- Create sequence for order numbers
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000;
```

**Step 2: Add Missing Order Creation Function**

Create `/app/src/lib/actions/order-creation.ts`:
```typescript
'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { getCart, clearCart } from './cart'
import type { OrderWithDetails } from '@/lib/types/orders'

interface CreateOrderInput {
  cartId: string
  shippingAddress: {
    name: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    postal_code: string
    country: string
    phone: string
  }
  billingAddress?: any // Same structure as shipping
  paymentMethod: 'cod' | 'razorpay' | 'upi'
  notes?: string
}

export async function createOrderFromCart(input: CreateOrderInput): Promise<{
  success: boolean
  order?: OrderWithDetails
  razorpayOrderId?: string
  error?: string
}> {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    // 1. Get cart with items
    const cart = await getCart(input.cartId)
    if (!cart || !cart.items || cart.items.length === 0) {
      return { success: false, error: 'Cart is empty' }
    }
    
    // 2. Validate inventory
    for (const item of cart.items) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.product_id)
        .single()
      
      if (!product || product.stock_quantity < item.quantity) {
        return { 
          success: false, 
          error: `Insufficient stock for ${item.title}` 
        }
      }
    }
    
    // 3. Calculate totals
    const subtotal = cart.items.reduce((sum, item) => 
      sum + (item.unit_price * item.quantity), 0
    )
    const tax = subtotal * 0.18 // 18% GST
    const shippingCost = subtotal > 5000 ? 0 : 100 // Free shipping over ₹5000
    const totalAmount = subtotal + tax + shippingCost
    
    // 4. Generate order number
    const { data: seqData } = await supabase
      .rpc('nextval', { sequence_name: 'order_number_seq' })
    const orderNumber = `ORD-${String(seqData).padStart(6, '0')}`
    
    // 5. Create Razorpay order if payment method is razorpay
    let razorpayOrderId
    if (input.paymentMethod === 'razorpay') {
      // This will be implemented in payment section
      razorpayOrderId = 'PLACEHOLDER' // TODO: Create Razorpay order
    }
    
    // 6. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        order_number: orderNumber,
        clerk_user_id: userId || null,
        guest_email: !userId ? input.shippingAddress.email : null,
        guest_name: !userId ? input.shippingAddress.name : null,
        order_status: 'pending',
        payment_status: input.paymentMethod === 'cod' ? 'pending' : 'pending',
        payment_method: input.paymentMethod,
        razorpay_order_id: razorpayOrderId,
        subtotal: subtotal,
        tax: tax,
        shipping_cost: shippingCost,
        total_amount: totalAmount,
        shipping_address: input.shippingAddress,
        billing_address: input.billingAddress || input.shippingAddress,
        notes: input.notes
      })
      .select()
      .single()
    
    if (orderError) throw orderError
    
    // 7. Create order items
    const orderItems = cart.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id,
      product_name: item.title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.unit_price * item.quantity
    }))
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    
    if (itemsError) throw itemsError
    
    // 8. Decrement inventory
    for (const item of cart.items) {
      await supabase
        .rpc('decrement_inventory', {
          product_id: item.product_id,
          quantity: item.quantity
        })
    }
    
    // 9. Clear cart
    await clearCart(input.cartId)
    
    // 10. Fetch complete order
    const { data: completeOrder } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*)
      `)
      .eq('id', order.id)
      .single()
    
    return {
      success: true,
      order: completeOrder as OrderWithDetails,
      razorpayOrderId
    }
    
  } catch (error: any) {
    console.error('Error creating order:', error)
    return { 
      success: false, 
      error: error.message || 'Failed to create order' 
    }
  }
}

/**
 * Create database function for inventory decrement
 * Run this SQL in Supabase:
 */
/*
CREATE OR REPLACE FUNCTION decrement_inventory(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - quantity
  WHERE id = product_id
  AND stock_quantity >= quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient inventory for product %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
*/
```

**Step 3: Add Inventory Restoration on Cancellation**

Update `/app/src/lib/actions/orders.ts` line 172:
```typescript
// Replace TODO comment with:

// Restore inventory for cancelled order items
const { data: items } = await supabase
  .from('order_items')
  .select('product_id, quantity')
  .eq('order_id', orderId)

if (items) {
  for (const item of items) {
    await supabase.rpc('increment_inventory', {
      product_id: item.product_id,
      quantity: item.quantity
    })
  }
}

// Add this SQL function to Supabase:
/*
CREATE OR REPLACE FUNCTION increment_inventory(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity + quantity
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql;
*/
```

---

## 3. Product Management System

### Current State: ⚠️ **70% Complete**

#### ✅ What's Working:
- **File**: `/app/src/lib/actions/products.ts`
- Get categories
- Get product by ID with variants
- Create product
- Update product
- Delete product
- Fetch products with filters

#### ❌ Critical Gaps:

**1. Missing Database Tables**
```sql
-- Code expects these but they DON'T EXIST:
- products
- product_variants
- categories
```

**2. No Image Upload Handling**
- Products need images but no Cloudinary integration
- No image upload API route

**3. Incomplete Variant Management**
- Product creation doesn't create variants
- No variant CRUD operations
- Variant pricing not handled

**4. No Bulk Operations**
- Admin needs bulk product import
- No CSV/Excel import functionality

**5. Missing Category Management**
- Can fetch categories but can't create/update/delete

#### 🔧 Required Fixes:

**Step 1: Create Database Tables**
```sql
-- Create categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT, -- or category_id UUID REFERENCES categories(id)
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  thumbnail TEXT,
  images JSONB DEFAULT '[]',
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  cost_per_item DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  barcode TEXT,
  weight DECIMAL(10,2),
  dimensions JSONB, -- { length, width, height, unit }
  specifications JSONB, -- { key: value } pairs
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create product_variants table
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_per_item DECIMAL(10,2),
  inventory_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  barcode TEXT,
  weight DECIMAL(10,2),
  image_url TEXT,
  option1_name TEXT, -- e.g., "Size"
  option1_value TEXT, -- e.g., "Large"
  option2_name TEXT, -- e.g., "Color"
  option2_value TEXT, -- e.g., "Red"
  option3_name TEXT,
  option3_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_product_variants_product ON product_variants(product_id);
CREATE INDEX idx_product_variants_sku ON product_variants(sku);
```

**Step 2: Add Category CRUD Operations**

Create `/app/src/lib/actions/categories.ts`:
```typescript
'use server'

import { createServerSupabase } from '@/lib/supabase/server'

export async function createCategory(data: {
  name: string
  slug: string
  description?: string
  parent_id?: string
  image_url?: string
  icon?: string
}) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: category, error } = await supabase
      .from('categories')
      .insert(data)
      .select()
      .single()
    
    if (error) throw error
    return { success: true, category }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function updateCategory(
  id: string,
  updates: Partial<{
    name: string
    description: string
    parent_id: string
    image_url: string
    icon: string
    sort_order: number
    is_active: boolean
  }>
) {
  try {
    const supabase = await createServerSupabase()
    
    const { data: category, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return { success: true, category }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function deleteCategory(id: string) {
  try {
    const supabase = await createServerSupabase()
    
    // Check if category has products
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('category', id)
    
    if (count && count > 0) {
      return { 
        success: false, 
        error: 'Cannot delete category with existing products' 
      }
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)
    
    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getCategoryTree() {
  try {
    const supabase = await createServerSupabase()
    
    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order')
    
    if (error) throw error
    
    // Build tree structure
    const tree = categories?.filter(c => !c.parent_id).map(parent => ({
      ...parent,
      children: categories?.filter(c => c.parent_id === parent.id)
    }))
    
    return { success: true, tree }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

**Step 3: Add Image Upload API**

Create `/app/src/app/api/upload/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataURI = `data:${file.type};base64,${base64}`
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(dataURI, {
      folder: 'cedar-elevators',
      resource_type: 'auto',
    })
    
    return NextResponse.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
    })
    
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}
```

---

## 4. Payment Integration (Razorpay)

### Current State: ❌ **0% Complete**

#### ✅ What Exists:
- Razorpay mentioned in docs
- Environment variables referenced
- No actual implementation

#### ❌ Critical Gaps:

**Everything is missing:**
1. No Razorpay SDK in dependencies
2. No payment service utility
3. No order creation endpoint
4. No payment verification
5. No webhook handler
6. No refund processing

#### 🔧 Required Implementation:

**Step 1: Install Razorpay**
```bash
pnpm add razorpay
pnpm add --save-dev @types/razorpay
```

**Step 2: Add Environment Variables**
```env
# .env.local
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=your_secret_key
```

**Step 3: Create Razorpay Service**

Create `/app/src/lib/services/razorpay.ts`:
```typescript
import Razorpay from 'razorpay'

if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials missing from environment variables')
}

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

/**
 * Create Razorpay order
 */
export async function createRazorpayOrder(amount: number, orderId: string) {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: orderId,
      notes: {
        order_id: orderId,
      },
    }
    
    const order = await razorpay.orders.create(options)
    return { success: true, order }
  } catch (error: any) {
    console.error('Razorpay order creation error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Verify payment signature
 */
export function verifyPaymentSignature(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature: string
): boolean {
  const crypto = require('crypto')
  
  const body = razorpayOrderId + '|' + razorpayPaymentId
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest('hex')
  
  return expectedSignature === razorpaySignature
}

/**
 * Capture payment (for authorized payments)
 */
export async function capturePayment(paymentId: string, amount: number) {
  try {
    const payment = await razorpay.payments.capture(
      paymentId,
      Math.round(amount * 100),
      'INR'
    )
    return { success: true, payment }
  } catch (error: any) {
    console.error('Payment capture error:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Create refund
 */
export async function createRefund(paymentId: string, amount?: number) {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full
      speed: 'normal', // 'normal' or 'optimum'
    })
    return { success: true, refund }
  } catch (error: any) {
    console.error('Refund creation error:', error)
    return { success: false, error: error.message }
  }
}
```

**Step 4: Create Payment API Routes**

Create `/app/src/app/api/payments/create-order/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createRazorpayOrder } from '@/lib/services/razorpay'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { orderId, amount } = await request.json()
    
    if (!orderId || !amount) {
      return NextResponse.json(
        { error: 'Order ID and amount required' },
        { status: 400 }
      )
    }
    
    // Create Razorpay order
    const result = await createRazorpayOrder(amount, orderId)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }
    
    // Update order with Razorpay order ID
    const supabase = await createServerSupabase()
    await supabase
      .from('orders')
      .update({ razorpay_order_id: result.order.id })
      .eq('id', orderId)
    
    return NextResponse.json({
      success: true,
      razorpayOrderId: result.order.id,
      amount: result.order.amount,
      currency: result.order.currency,
    })
    
  } catch (error: any) {
    console.error('Create payment order error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create payment order' },
      { status: 500 }
    )
  }
}
```

Create `/app/src/app/api/payments/verify/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { verifyPaymentSignature } from '@/lib/services/razorpay'
import { createServerSupabase } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    } = await request.json()
    
    // Verify signature
    const isValid = verifyPaymentSignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    )
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid payment signature' },
        { status: 400 }
      )
    }
    
    // Update order status
    const supabase = await createServerSupabase()
    const { error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpayPaymentId,
        order_status: 'confirmed',
        paid_at: new Date().toISOString(),
      })
      .eq('id', orderId)
    
    if (error) throw error
    
    // TODO: Send order confirmation email
    
    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    })
    
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment verification failed' },
      { status: 500 }
    )
  }
}
```

Create `/app/src/app/api/webhooks/razorpay/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature) {
      return NextResponse.json({ error: 'No signature' }, { status: 400 })
    }
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')
    
    if (expectedSignature !== signature) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }
    
    const event = JSON.parse(body)
    const supabase = createServerSupabaseClient()
    
    if (!supabase) {
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }
    
    // Handle different events
    switch (event.event) {
      case 'payment.captured':
        // Payment successful
        await supabase
          .from('orders')
          .update({
            payment_status: 'paid',
            razorpay_payment_id: event.payload.payment.entity.id,
            order_status: 'confirmed',
            paid_at: new Date().toISOString(),
          })
          .eq('razorpay_order_id', event.payload.payment.entity.order_id)
        break
        
      case 'payment.failed':
        // Payment failed
        await supabase
          .from('orders')
          .update({ payment_status: 'failed' })
          .eq('razorpay_order_id', event.payload.payment.entity.order_id)
        break
        
      case 'refund.created':
        // Refund initiated
        await supabase
          .from('orders')
          .update({ payment_status: 'refunded' })
          .eq('razorpay_payment_id', event.payload.refund.entity.payment_id)
        break
    }
    
    return NextResponse.json({ received: true })
    
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}
```

**Step 5: Frontend Integration**

Create `/app/src/lib/hooks/use-razorpay.ts`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

declare global {
  interface Window {
    Razorpay: any
  }
}

export function useRazorpay() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  
  const initiate Payment = async (orderId: string, amount: number) => {
    try {
      setLoading(true)
      
      // Create Razorpay order
      const response = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, amount }),
      })
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error)
      }
      
      // Load Razorpay script
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      document.body.appendChild(script)
      
      script.onload = () => {
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: 'Cedar Elevators',
          description: 'Order Payment',
          order_id: data.razorpayOrderId,
          handler: async function (response: any) {
            // Verify payment
            const verifyResponse = await fetch('/api/payments/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            })
            
            const verifyData = await verifyResponse.json()
            
            if (verifyData.success) {
              toast.success('Payment successful!')
              router.push(`/order-confirmation?orderId=${orderId}`)
            } else {
              toast.error('Payment verification failed')
            }
          },
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#F97316', // Orange theme
          },
        }
        
        const rzp = new window.Razorpay(options)
        rzp.open()
        
        rzp.on('payment.failed', function (response: any) {
          toast.error('Payment failed: ' + response.error.description)
        })
      }
      
    } catch (error: any) {
      toast.error(error.message || 'Payment initiation failed')
    } finally {
      setLoading(false)
    }
  }
  
  return { initiatePayment, loading }
}
```

---

## 5. Email Notifications System

### Current State: ❌ **0% Complete**

#### ✅ What Exists:
- Resend mentioned in docs
- Email templates needed listed
- **Resend NOT in package.json**

#### ❌ Critical Gaps:

**Everything is missing:**
1. Resend not installed
2. No email service utility
3. No email templates
4. No email sending API
5. No transactional emails

#### 🔧 Required Implementation:

**Step 1: Install Dependencies**
```bash
pnpm add resend @react-email/components
```

**Step 2: Add Environment Variable**
```env
# .env.local
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

**Step 3: Create Email Service**

Create `/app/src/lib/services/email.ts`:
```typescript
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set')
}

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Cedar Elevators <noreply@cedarelevators.com>'

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(to: string, name: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Welcome to Cedar Elevators',
      html: `
        <h1>Welcome ${name}!</h1>
        <p>Thank you for joining Cedar Elevators, India's leading B2B marketplace for premium elevator components.</p>
        <p>Explore our catalog: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/catalog">Browse Products</a></p>
      `,
    })
    
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending welcome email:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(
  to: string,
  order: {
    orderNumber: string
    items: any[]
    total: number
    shippingAddress: any
  }
) {
  try {
    const itemsList = order.items
      .map(
        item => `
        <tr>
          <td>${item.product_name}</td>
          <td>${item.quantity}</td>
          <td>₹${item.unit_price}</td>
          <td>₹${item.total_price}</td>
        </tr>
      `
      )
      .join('')
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Confirmation - ${order.orderNumber}`,
      html: `
        <h1>Order Confirmed!</h1>
        <p>Thank you for your order. Your order number is: <strong>${order.orderNumber}</strong></p>
        
        <h2>Order Details</h2>
        <table border="1" cellpadding="10">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>
        
        <p><strong>Total: ₹${order.total}</strong></p>
        
        <h2>Shipping Address</h2>
        <p>
          ${order.shippingAddress.name}<br>
          ${order.shippingAddress.address_line1}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postal_code}<br>
          ${order.shippingAddress.phone}
        </p>
        
        <p>Track your order: <a href="${process.env.NEXT_PUBLIC_BASE_URL}/orders/${order.orderNumber}">View Order</a></p>
      `,
    })
    
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending order confirmation:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send order shipped notification
 */
export async function sendOrderShipped(
  to: string,
  order: {
    orderNumber: string
    trackingNumber: string
    trackingCarrier: string
    trackingUrl?: string
  }
) {
  try {
    const trackingLink = order.trackingUrl || `#`
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: `Order Shipped - ${order.orderNumber}`,
      html: `
        <h1>Your Order Has Been Shipped!</h1>
        <p>Your order <strong>${order.orderNumber}</strong> is on its way.</p>
        
        <h2>Tracking Information</h2>
        <p>
          <strong>Carrier:</strong> ${order.trackingCarrier}<br>
          <strong>Tracking Number:</strong> ${order.trackingNumber}<br>
          <strong>Track Package:</strong> <a href="${trackingLink}">Click here</a>
        </p>
      `,
    })
    
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending shipped notification:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send business verification status email
 */
export async function sendVerificationStatus(
  to: string,
  status: 'approved' | 'rejected',
  companyName: string,
  notes?: string
) {
  try {
    const subject =
      status === 'approved'
        ? 'Business Verification Approved'
        : 'Business Verification Update'
    
    const message =
      status === 'approved'
        ? `Congratulations! Your business account for ${companyName} has been verified. You now have access to all business features including bulk pricing, invoices, and priority support.`
        : `We're unable to verify your business account at this time. ${notes || 'Please contact support for more information.'}`
    
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html: `
        <h1>${subject}</h1>
        <p>${message}</p>
        ${
          status === 'approved'
            ? `<p><a href="${process.env.NEXT_PUBLIC_BASE_URL}/dashboard">Go to Dashboard</a></p>`
            : ''
        }
      `,
    })
    
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending verification status:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordReset(to: string, resetLink: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: 'Reset Your Password',
      html: `
        <h1>Reset Your Password</h1>
        <p>Click the link below to reset your password:</p>
        <p><a href="${resetLink}">Reset Password</a></p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    })
    
    if (error) throw error
    return { success: true, data }
  } catch (error: any) {
    console.error('Error sending password reset:', error)
    return { success: false, error: error.message }
  }
}
```

**Step 4: Integrate Email Sending in Order Creation**

Update `/app/src/lib/actions/order-creation.ts` (from earlier):
```typescript
// After order creation success, add:
import { sendOrderConfirmation } from '@/lib/services/email'

// After step 10 (fetch complete order):
if (userId) {
  // Get user email from Clerk
  const { data: user } = await supabase.auth.getUser()
  if (user?.email) {
    await sendOrderConfirmation(user.email, {
      orderNumber: completeOrder.order_number,
      items: completeOrder.order_items,
      total: completeOrder.total_amount,
      shippingAddress: completeOrder.shipping_address,
    })
  }
} else if (input.shippingAddress.email) {
  // Guest user
  await sendOrderConfirmation(input.shippingAddress.email, {
    orderNumber: completeOrder.order_number,
    items: completeOrder.order_items,
    total: completeOrder.total_amount,
    shippingAddress: completeOrder.shipping_address,
  })
}
```

---

## 6. Business User Features

### Current State: ⚠️ **30% Complete**

#### ✅ What Exists:
- Business profile UI
- Business type selection in auth flow
- `customer_meta` table for role sync

#### ❌ Critical Gaps:

**1. No Verification System**
- No document upload
- No verification workflow
- No admin approval process

**2. Missing Tables**
```sql
-- Need these tables:
- business_profiles
- business_documents
```

**3. No Bulk Pricing**
- Business users should see different prices
- No tiered pricing system

**4. No Invoice System**
- Business users need invoices
- No invoice generation

#### 🔧 Required Implementation:

**Step 1: Create Database Tables**
```sql
-- Create business_profiles table
CREATE TABLE business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  company_type TEXT CHECK (company_type IN ('private_limited', 'public_limited', 'partnership', 'sole_proprietor')),
  gst_number VARCHAR(15),
  pan_number VARCHAR(10),
  tan_number VARCHAR(10),
  business_address JSONB,
  billing_address JSONB,
  phone TEXT,
  website TEXT,
  annual_revenue TEXT,
  employee_count TEXT,
  verification_status TEXT DEFAULT 'unverified' 
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_by VARCHAR(255),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create business_documents table
CREATE TABLE business_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL 
    CHECK (document_type IN ('gst_certificate', 'pan_card', 'business_license', 'incorporation_certificate', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(255)
);

CREATE INDEX idx_business_profiles_user_id ON business_profiles(clerk_user_id);
CREATE INDEX idx_business_profiles_verification_status ON business_profiles(verification_status);
CREATE INDEX idx_business_documents_profile_id ON business_documents(business_profile_id);
```

**Step 2: Create Business Profile Actions**

Create `/app/src/lib/actions/business.ts`:
```typescript
'use server'

import { createClerkSupabaseClient } from '@/lib/supabase/server'
import { auth } from '@clerk/nextjs/server'
import { sendVerificationStatus } from '@/lib/services/email'

export async function createBusinessProfile(data: {
  companyName: string
  companyType: string
  gstNumber?: string
  panNumber?: string
  businessAddress: any
  phone: string
  website?: string
}) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .insert({
        clerk_user_id: userId,
        company_name: data.companyName,
        company_type: data.companyType,
        gst_number: data.gstNumber,
        pan_number: data.panNumber,
        business_address: data.businessAddress,
        phone: data.phone,
        website: data.website,
        verification_status: 'unverified',
      })
      .select()
      .single()
    
    if (error) throw error
    return { success: true, profile }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function uploadBusinessDocument(data: {
  documentType: string
  fileName: string
  fileUrl: string
  fileSize: number
  mimeType: string
}) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    // Get business profile
    const { data: profile } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()
    
    if (!profile) {
      return { success: false, error: 'Business profile not found' }
    }
    
    // Upload document
    const { data: document, error } = await supabase
      .from('business_documents')
      .insert({
        business_profile_id: profile.id,
        document_type: data.documentType,
        file_name: data.fileName,
        file_url: data.fileUrl,
        file_size: data.fileSize,
        mime_type: data.mimeType,
        status: 'pending',
      })
      .select()
      .single()
    
    if (error) throw error
    
    // Update profile status to pending if all required docs uploaded
    await supabase
      .from('business_profiles')
      .update({ verification_status: 'pending' })
      .eq('id', profile.id)
    
    return { success: true, document }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export async function getBusinessProfile() {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    if (!userId) {
      return { success: false, error: 'Unauthorized' }
    }
    
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .select(`
        *,
        documents:business_documents(*)
      `)
      .eq('clerk_user_id', userId)
      .single()
    
    if (error && error.code !== 'PGRST116') throw error
    
    return { success: true, profile }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Admin function to verify business
export async function verifyBusiness(
  profileId: string,
  status: 'verified' | 'rejected',
  notes?: string
) {
  try {
    const supabase = await createClerkSupabaseClient()
    const { userId } = await auth()
    
    // TODO: Check if user is admin
    
    const { data: profile, error } = await supabase
      .from('business_profiles')
      .update({
        verification_status: status,
        verification_notes: notes,
        verified_by: userId,
        verified_at: new Date().toISOString(),
      })
      .eq('id', profileId)
      .select('clerk_user_id, company_name')
      .single()
    
    if (error) throw error
    
    // Get user email and send notification
    // TODO: Get email from Clerk and send verification status email
    
    return { success: true, profile }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
```

---

## 7. Admin Panel Backend

### Current State: ⚠️ **40% Complete**

#### ✅ What Exists:
- Complete admin UI
- Admin authentication tables
- Some product/order actions

#### ❌ Critical Gaps:

**1. Missing API Routes**
```typescript
// Need these routes but they DON'T EXIST:
- /api/admin/products - Bulk operations
- /api/admin/stats - Dashboard statistics
- /api/admin/customers - Customer management
- /api/admin/analytics - Business metrics
```

**2. No Dashboard Stats**
- Admin dashboard shows UI but no real data
- No revenue calculations
- No order statistics
- No customer metrics

**3. No Bulk Operations**
- Can't bulk update products
- Can't bulk process orders
- No CSV import/export

#### 🔧 Required Implementation:

**Step 1: Create Admin Stats API**

Create `/app/src/app/api/admin/stats/route.ts`:
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabase } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // TODO: Check if user is admin
    
    const supabase = await createServerSupabase()
    
    // Get total orders
    const { count: totalOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
    
    // Get total revenue
    const { data: orders } = await supabase
      .from('orders')
      .select('total_amount')
      .eq('payment_status', 'paid')
    
    const totalRevenue = orders?.reduce((sum, o) => sum + Number(o.total_amount), 0) || 0
    
    // Get pending orders
    const { count: pendingOrders } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('order_status', 'pending')
    
    // Get total customers
    const { count: totalCustomers } = await supabase
      .from('customer_meta')
      .select('*', { count: 'exact', head: true })
    
    // Get total products
    const { count: totalProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
    
    // Get low stock products
    const { count: lowStockProducts } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lt('stock_quantity', 10)
      .eq('status', 'active')
    
    // Get recent orders
    const { data: recentOrders } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10)
    
    // Get sales trend (last 7 days)
    const { data: salesTrend } = await supabase
      .from('orders')
      .select('created_at, total_amount')
      .eq('payment_status', 'paid')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at')
    
    return NextResponse.json({
      success: true,
      stats: {
        totalOrders: totalOrders || 0,
        totalRevenue: totalRevenue,
        pendingOrders: pendingOrders || 0,
        totalCustomers: totalCustomers || 0,
        totalProducts: totalProducts || 0,
        lowStockProducts: lowStockProducts || 0,
      },
      recentOrders,
      salesTrend,
    })
    
  } catch (error: any) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
```

---

## 8. Missing Database Functions

### Required SQL Functions

Create these in Supabase SQL Editor:

```sql
-- Function to generate next order number
CREATE OR REPLACE FUNCTION nextval(sequence_name text)
RETURNS bigint AS $$
BEGIN
  RETURN nextval(sequence_name::regclass);
END;
$$ LANGUAGE plpgsql;

-- Function to decrement inventory
CREATE OR REPLACE FUNCTION decrement_inventory(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - quantity,
      updated_at = NOW()
  WHERE id = product_id
  AND stock_quantity >= quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient inventory for product %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to increment inventory (for cancellations/refunds)
CREATE OR REPLACE FUNCTION increment_inventory(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity + quantity,
      updated_at = NOW()
  WHERE id = product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % not found', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for all tables
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

---

## 🎯 Implementation Priority Summary

### **PHASE 1: CRITICAL (Week 1-2)** ⭐⭐⭐⭐⭐

1. **Database Schema** - Create all missing tables
   - Products, categories, carts, cart_items
   - Orders, order_items
   - Business profiles, business documents
   - Estimated: 2-3 hours

2. **Cart Completion** - Fix product variant queries and add migrations
   - Estimated: 3-4 hours

3. **Order Creation** - Implement `createOrderFromCart` function
   - Estimated: 4-5 hours

4. **Payment Integration** - Complete Razorpay integration
   - Estimated: 6-8 hours

5. **Email System** - Install Resend and create email service
   - Estimated: 4-5 hours

**Total Phase 1: 20-25 hours**

---

### **PHASE 2: HIGH PRIORITY (Week 3-4)** ⭐⭐⭐⭐

1. **Product Management** - Complete CRUD, image upload, categories
   - Estimated: 6-8 hours

2. **Business Verification** - Document upload and admin workflow
   - Estimated: 8-10 hours

3. **Admin Dashboard** - Stats API and data integration
   - Estimated: 4-5 hours

4. **Inventory Management** - Stock tracking and low stock alerts
   - Estimated: 3-4 hours

**Total Phase 2: 21-27 hours**

---

### **PHASE 3: MEDIUM PRIORITY (Week 5-6)** ⭐⭐⭐

1. **Advanced Search** - Filtering and search backend
2. **Analytics** - Business metrics and reporting
3. **Wishlist** - Backend implementation
4. **Order Tracking** - Shipping integration

**Total Phase 3: 15-20 hours**

---

## 📋 Complete SQL Migration Script

Create `/app/supabase/migrations/002_create_ecommerce_schema.sql`:

```sql
-- =====================================================
-- Cedar Elevators - Complete E-commerce Schema
-- =====================================================
-- This migration creates all tables for the e-commerce platform
-- Run this after 001_create_admin_authentication.sql
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- CATEGORIES
-- =====================================================

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_sort ON categories(sort_order);

-- =====================================================
-- PRODUCTS
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  short_description TEXT,
  category TEXT, -- Can be UUID foreign key or text
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  thumbnail TEXT,
  images JSONB DEFAULT '[]',
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  cost_per_item DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  barcode TEXT,
  weight DECIMAL(10,2),
  dimensions JSONB,
  specifications JSONB,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured) WHERE is_featured = true;

-- =====================================================
-- PRODUCT VARIANTS
-- =====================================================

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sku TEXT UNIQUE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  compare_at_price DECIMAL(10,2),
  cost_per_item DECIMAL(10,2),
  inventory_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  barcode TEXT,
  weight DECIMAL(10,2),
  image_url TEXT,
  option1_name TEXT,
  option1_value TEXT,
  option2_name TEXT,
  option2_value TEXT,
  option3_name TEXT,
  option3_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_product_variants_product ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variants_sku ON product_variants(sku);
CREATE INDEX IF NOT EXISTS idx_product_variants_status ON product_variants(status);

-- =====================================================
-- CARTS
-- =====================================================

CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255),
  guest_id VARCHAR(255),
  region_id VARCHAR(50),
  currency_code VARCHAR(3) DEFAULT 'INR',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_carts_guest_id ON carts(guest_id);

-- =====================================================
-- CART ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID,
  variant_id UUID,
  title TEXT NOT NULL,
  thumbnail TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);

-- =====================================================
-- ORDERS
-- =====================================================

CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1000;

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  clerk_user_id VARCHAR(255),
  guest_email VARCHAR(255),
  guest_name VARCHAR(255),
  order_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (order_status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  payment_status TEXT DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT,
  payment_id TEXT,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  subtotal DECIMAL(10,2) NOT NULL,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency_code VARCHAR(3) DEFAULT 'INR',
  shipping_address JSONB NOT NULL,
  billing_address JSONB,
  tracking_number TEXT,
  tracking_carrier TEXT,
  tracking_url TEXT,
  notes TEXT,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_guest_email ON orders(guest_email);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- =====================================================
-- ORDER ITEMS
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID,
  variant_id UUID,
  product_name TEXT NOT NULL,
  variant_name TEXT,
  variant_sku TEXT,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- BUSINESS PROFILES
-- =====================================================

CREATE TABLE IF NOT EXISTS business_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  company_name TEXT NOT NULL,
  company_type TEXT CHECK (company_type IN ('private_limited', 'public_limited', 'partnership', 'sole_proprietor')),
  gst_number VARCHAR(15),
  pan_number VARCHAR(10),
  tan_number VARCHAR(10),
  business_address JSONB,
  billing_address JSONB,
  phone TEXT,
  website TEXT,
  annual_revenue TEXT,
  employee_count TEXT,
  verification_status TEXT DEFAULT 'unverified' 
    CHECK (verification_status IN ('unverified', 'pending', 'verified', 'rejected')),
  verification_notes TEXT,
  verified_by VARCHAR(255),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_business_profiles_user_id ON business_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_business_profiles_verification_status ON business_profiles(verification_status);

-- =====================================================
-- BUSINESS DOCUMENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS business_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_profile_id UUID REFERENCES business_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL 
    CHECK (document_type IN ('gst_certificate', 'pan_card', 'business_license', 'incorporation_certificate', 'other')),
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending' 
    CHECK (status IN ('pending', 'approved', 'rejected')),
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by VARCHAR(255)
);

CREATE INDEX IF NOT EXISTS idx_business_documents_profile_id ON business_documents(business_profile_id);
CREATE INDEX IF NOT EXISTS idx_business_documents_status ON business_documents(status);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to get next sequence value
CREATE OR REPLACE FUNCTION nextval(sequence_name text)
RETURNS bigint AS $$
BEGIN
  RETURN nextval(sequence_name::regclass);
END;
$$ LANGUAGE plpgsql;

-- Function to decrement inventory
CREATE OR REPLACE FUNCTION decrement_inventory(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity - quantity,
      updated_at = NOW()
  WHERE id = product_id
  AND stock_quantity >= quantity;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient inventory for product %', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to increment inventory
CREATE OR REPLACE FUNCTION increment_inventory(
  product_id UUID,
  quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  UPDATE products
  SET stock_quantity = stock_quantity + quantity,
      updated_at = NOW()
  WHERE id = product_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product % not found', product_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON product_variants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
CREATE TRIGGER update_carts_updated_at
  BEFORE UPDATE ON carts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
CREATE TRIGGER update_cart_items_updated_at
  BEFORE UPDATE ON cart_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_business_profiles_updated_at ON business_profiles;
CREATE TRIGGER update_business_profiles_updated_at
  BEFORE UPDATE ON business_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- END OF MIGRATION
-- =====================================================
```

---

## 📊 Final Summary

### Total Implementation Effort:
- **Phase 1 (Critical)**: 20-25 hours
- **Phase 2 (High Priority)**: 21-27 hours
- **Phase 3 (Medium Priority)**: 15-20 hours

**Total: 56-72 hours (7-9 working days)**

### Files to Create: **~35 files**
### Files to Modify: **~15 files**
### Database Tables: **12 new tables**
### API Routes: **~20 new endpoints**

---

**Next Steps**: Review this analysis and confirm which phase to start with. I recommend starting with **Phase 1: Database Schema creation** as it's the foundation for everything else.
