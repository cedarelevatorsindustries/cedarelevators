// Checkout Module Types

export type UserCheckoutType = 
  | 'guest'
  | 'individual'
  | 'business_unverified'
  | 'business_verified'

export type CheckoutStep = 
  | 'email_capture'
  | 'blocked'
  | 'shipping'
  | 'payment'
  | 'review'
  | 'confirmation'

export interface CheckoutAddress {
  id?: string
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  gstin?: string
  isDefault?: boolean
}

export interface DeliveryOption {
  id: string
  name: string
  description: string
  price: number
  estimatedDays: string
  isDefault?: boolean
}

export interface PaymentMethod {
  id: string
  type: 'credit_30_day' | 'po_upload' | 'razorpay' | 'bank_transfer'
  name: string
  description: string
  icon?: string
  isDefault?: boolean
  requiresVerification?: boolean
}

export interface CheckoutState {
  step: CheckoutStep
  userType: UserCheckoutType
  email?: string
  phone?: string
  companyName?: string
  shippingAddress?: CheckoutAddress
  billingAddress?: CheckoutAddress
  sameAsShipping: boolean
  deliveryOption?: DeliveryOption
  paymentMethod?: PaymentMethod
  poFile?: File
  additionalRequirements?: string
  termsAccepted: boolean
}

export interface OrderSummaryItem {
  id: string
  title: string
  thumbnail: string | null
  quantity: number
  unitPrice: number
  subtotal: number
  variantTitle?: string
}

export interface OrderSummary {
  items: OrderSummaryItem[]
  subtotal: number
  discount: number
  shipping: number
  tax: number
  gstBreakdown?: {
    cgst: number
    sgst: number
    igst: number
  }
  bulkDiscount?: number
  total: number
  showPrices: boolean
}

export interface CheckoutContextValue {
  state: CheckoutState
  orderSummary: OrderSummary
  updateState: (updates: Partial<CheckoutState>) => void
  nextStep: () => void
  prevStep: () => void
  canProceed: boolean
  isProcessing: boolean
  placeOrder: () => Promise<void>
  requestQuote: () => Promise<void>
}
