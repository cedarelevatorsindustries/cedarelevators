"use server"

import { createServerSupabase } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Product, ProductFormData } from "@/lib/types/products"
import { cloudinary } from "@/lib/cloudinary/config"
import { logger } from "@/lib/services/logger"
import type { ActionResult } from "@/lib/types/action-result"

/**
 * Create new product
 */
export async function createProduct(productData: ProductFormData): Promise<ActionResult<Product>> {
    const supabase = await createServerSupabase()

    try {
        // Ensure slug is unique
        const { data: existingSlug } = await supabase
            .from('products')
            .select('id')
            .eq('slug', productData.slug)
            .single()

        if (existingSlug) {
            return { success: false, error: 'Product with this URL handle already exists' }
        }

        // Separate junction table IDs and variants from main product data
        const {
            elevator_type_ids,
            collection_ids,
            application_ids,
            category_ids,
            subcategory_ids,
            variants,
            ...mainProductData
        } = productData

        // Set is_categorized based on whether product has proper classification
        const is_categorized = !!(
            (application_ids && application_ids.length > 0) &&
            (category_ids && category_ids.length > 0)
        )

        // Process images: upload deferred images to Cloudinary
        let processedImages = mainProductData.images || []

        // Check if we have images with base64 data to upload
        if (processedImages.length > 0) {
            const productSlug = mainProductData.slug

            const uploadPromises = processedImages.map(async (img: any) => {
                // If image has base64 data, upload it
                if (img.base64) {
                    try {
                        const result = await cloudinary.uploader.upload(img.base64, {
                            folder: `products/${productSlug}`,
                            public_id: img.id,
                            resource_type: 'auto',
                            transformation: [
                                { quality: 'auto:good' },
                                { fetch_format: 'auto' }
                            ]
                        })

                        return {
                            id: result.public_id,
                            url: result.secure_url,
                            alt: img.alt,
                            is_primary: img.isPrimary ?? img.is_primary ?? false,
                            sort_order: img.sort_order || 0,
                            public_id: result.public_id
                        }
                    } catch (uploadError) {
                        logger.error('Failed to upload image to Cloudinary', uploadError)
                        throw new Error(`Failed to upload image: ${img.alt}`)
                    }
                }

                // If valid image without base64 (already uploaded or external URL)
                return {
                    ...img,
                    is_primary: img.isPrimary ?? img.is_primary ?? false,
                }
            })

            processedImages = await Promise.all(uploadPromises)
        }

        // Fallback image if no images provided after processing
        if (processedImages.length === 0) {
            processedImages = [{
                id: 'default-image',
                url: '/images/image.png',
                alt: 'Default Product Image',
                is_primary: true,
                sort_order: 0
            }]
        }

        // Prepare product data
        const productToInsert = {
            ...mainProductData,
            is_categorized,
            thumbnail_url: mainProductData.thumbnail_url || processedImages.find(img => img.is_primary)?.url || processedImages[0]?.url,
            tags: mainProductData.tags || [],
            technical_specs: mainProductData.technical_specs || {},
            images: processedImages,
        }

        // Insert product
        const { data: product, error: productError } = await supabase
            .from('products')
            .insert([productToInsert])
            .select()
            .single()

        if (productError) {
            logger.error('Error creating product', productError)
            return { success: false, error: 'Failed to create product' }
        }

        // Insert elevator type relationships
        if (elevator_type_ids && elevator_type_ids.length > 0) {
            const elevatorTypeRecords = elevator_type_ids.map((typeId) => ({
                product_id: product.id,
                elevator_type_id: typeId,
            }))

            const { error: elevatorTypesError } = await supabase
                .from('product_elevator_types')
                .insert(elevatorTypeRecords)

            if (elevatorTypesError) {
                logger.error('Error creating product-elevator type relationships', elevatorTypesError)
                await supabase.from('products').delete().eq('id', product.id)
                return { success: false, error: 'Failed to assign elevator types' }
            }
        }

        // Insert collection relationships
        if (collection_ids && collection_ids.length > 0) {
            const collectionRecords = collection_ids.map((collectionId, index) => ({
                product_id: product.id,
                collection_id: collectionId,
                position: index,
            }))

            const { error: collectionsError } = await supabase
                .from('product_collections')
                .insert(collectionRecords)

            if (collectionsError) {
                logger.error('Error creating product-collection relationships', collectionsError)
            }
        }

        // Insert application relationships
        if (application_ids && application_ids.length > 0) {
            const applicationRecords = application_ids.map((applicationId: string) => ({
                product_id: product.id,
                application_id: applicationId,
            }))

            const { error: applicationsError } = await supabase
                .from('product_applications')
                .insert(applicationRecords)

            if (applicationsError) {
                logger.error('Error creating product-application relationships', applicationsError)
            }
        }

        // Insert category relationships
        if (category_ids && category_ids.length > 0) {
            const categoryRecords = category_ids.map((categoryId: string) => ({
                product_id: product.id,
                category_id: categoryId,
            }))

            const { error: categoriesError } = await supabase
                .from('product_categories')
                .insert(categoryRecords)

            if (categoriesError) {
                logger.error('Error creating product-category relationships', categoriesError)
            }
        }

        // Insert subcategory relationships
        if (subcategory_ids && subcategory_ids.length > 0) {
            const subcategoryRecords = subcategory_ids.map((subcategoryId: string) => ({
                product_id: product.id,
                subcategory_id: subcategoryId,
            }))

            const { error: subcategoriesError } = await supabase
                .from('product_subcategories')
                .insert(subcategoryRecords)

            if (subcategoriesError) {
                logger.error('Error creating product-subcategory relationships', subcategoriesError)
            }
        }

        // Insert product variants
        let variantsToInsert = [];

        if (productData.variants && Array.isArray(productData.variants) && productData.variants.length > 0) {
            variantsToInsert = productData.variants.map((variant: any) => ({
                product_id: product.id,
                name: variant.name || 'Default',
                sku: variant.sku || `${product.sku || 'SKU'}-${Math.random().toString(36).substr(2, 9)}`,
                price: parseFloat(variant.price) || product.price || 0,
                compare_at_price: variant.compareAtPrice || variant.mrp ? parseFloat(variant.compareAtPrice || variant.mrp) : null,
                cost_per_item: variant.cost ? parseFloat(variant.cost) : null,
                inventory_quantity: parseInt(variant.quantity || variant.stock) || 0,
                status: variant.status || (variant.active ? 'active' : 'draft'),
                barcode: variant.barcode || null,
                weight: variant.weight ? parseFloat(variant.weight) : null,
                image_url: variant.image || null,
                option1_name: variant.option1?.name || null,
                option1_value: variant.option1?.value || null,
                option2_name: variant.option2?.name || null,
                option2_value: variant.option2?.value || null,
                option3_name: variant.option3?.name || null,
                option3_value: variant.option3?.value || null,
            }));
        } else {
            // Create a default variant for simple products so inventory is tracked
            logger.info('No variants provided, creating default variant for simple product');
            variantsToInsert = [{
                product_id: product.id,
                name: 'Default',
                sku: product.sku || `SKU-${Math.random().toString(36).substr(2, 9)}`,
                price: product.price || 0,
                compare_at_price: product.compare_at_price || null,
                cost_per_item: product.cost_per_item || null,
                inventory_quantity: product.stock_quantity || 0,
                status: 'active',
                barcode: null,
                weight: null,
                image_url: product.thumbnail_url || null,
            }];
        }

        if (variantsToInsert.length > 0) {
            const { data: createdVariants, error: variantsError } = await supabase
                .from('product_variants')
                .insert(variantsToInsert)
                .select()

            if (variantsError) {
                logger.error('Error creating product variants', variantsError)
            } else if (createdVariants && createdVariants.length > 0) {
                // Verify inventory was created by triggers
                logger.info(`Created ${createdVariants.length} variants for product ${product.id}`)

                // Check if inventory records were created (they should be created automatically by triggers)
                const { data: inventoryCheck } = await supabase
                    .from('inventory_items')
                    .select('id, variant_id, quantity, reserved, available_quantity')
                    .in('variant_id', createdVariants.map(v => v.id))

                if (inventoryCheck && inventoryCheck.length > 0) {
                    logger.info(`Inventory initialized for ${inventoryCheck.length} variants`, inventoryCheck)
                } else {
                    logger.warn(`No inventory records found for variants - triggers may not have fired`)
                }
            }
        }

        revalidatePath('/admin/products')
        return { success: true, data: product as Product }

    } catch (error: any) {
        logger.error('Unexpected error creating product', error)
        return { success: false, error: error.message || 'An unexpected error occurred' }
    }
}

/**
 * Update existing product
 */
export async function updateProduct(productId: string, productData: any): Promise<ActionResult<Product>> {
    const supabase = await createServerSupabase()

    try {
        const {
            variants,
            elevator_type_ids,
            collection_ids,
            application_ids,
            category_ids,
            subcategory_ids,
            images,
            ...productToUpdate
        } = productData

        // Handle image uploads
        const processedImages = await Promise.all(
            (images || []).map(async (img: any, index: number) => {
                if (img.base64) {
                    try {
                        const result = await cloudinary.uploader.upload(img.base64, {
                            folder: `products/${productData.slug}`,
                            resource_type: 'auto',
                            transformation: [
                                { quality: 'auto:good' },
                                { fetch_format: 'auto' }
                            ]
                        })

                        return {
                            id: result.public_id,
                            url: result.secure_url,
                            alt: img.alt,
                            is_primary: img.isPrimary ?? img.is_primary ?? false,
                            sort_order: index,
                            public_id: result.public_id
                        }
                    } catch (uploadError) {
                        logger.error('Failed to upload image to Cloudinary', uploadError)
                        throw new Error(`Failed to upload image: ${img.alt}`)
                    }
                } else {
                    return {
                        id: img.id,
                        url: img.url,
                        alt: img.alt,
                        is_primary: img.isPrimary ?? img.is_primary ?? false,
                        sort_order: index,
                        public_id: img.public_id
                    }
                }
            })
        )

        // Update main product
        const { data: updatedProduct, error: productError } = await supabase
            .from('products')
            .update({
                ...productToUpdate,
                is_categorized: !!(
                    (application_ids && application_ids.length > 0) &&
                    (category_ids && category_ids.length > 0)
                ),
                thumbnail_url: productToUpdate.thumbnail_url || processedImages.find(img => img.is_primary)?.url || processedImages[0]?.url,
                tags: productToUpdate.tags || [],
                technical_specs: productToUpdate.technical_specs || {},
                images: processedImages,
                updated_at: new Date().toISOString()
            })
            .eq('id', productId)
            .select()
            .single()

        if (productError) {
            logger.error('Error updating product', productError)
            throw productError
        }

        // Update elevator types junction table
        if (elevator_type_ids !== undefined) {
            await supabase
                .from('product_elevator_types')
                .delete()
                .eq('product_id', productId)

            if (elevator_type_ids.length > 0) {
                const typeAssociations = elevator_type_ids.map((typeId: string) => ({
                    product_id: productId,
                    elevator_type_id: typeId
                }))

                const { error: typesError } = await supabase
                    .from('product_elevator_types')
                    .insert(typeAssociations)

                if (typesError) {
                    logger.error('Error updating elevator types', typesError)
                }
            }
        }

        // Update collections junction table
        if (collection_ids !== undefined) {
            await supabase
                .from('product_collections')
                .delete()
                .eq('product_id', productId)

            if (collection_ids.length > 0) {
                const collectionAssociations = collection_ids.map((collectionId: string, index: number) => ({
                    product_id: productId,
                    collection_id: collectionId,
                    position: index
                }))

                const { error: collectionsError } = await supabase
                    .from('product_collections')
                    .insert(collectionAssociations)

                if (collectionsError) {
                    logger.error('Error updating collections', collectionsError)
                }
            }
        }

        // Update applications junction table
        if (application_ids !== undefined) {
            await supabase
                .from('product_applications')
                .delete()
                .eq('product_id', productId)

            if (application_ids.length > 0) {
                const applicationAssociations = application_ids.map((applicationId: string) => ({
                    product_id: productId,
                    application_id: applicationId
                }))

                const { error: applicationsError } = await supabase
                    .from('product_applications')
                    .insert(applicationAssociations)

                if (applicationsError) {
                    logger.error('Error updating applications', applicationsError)
                }
            }
        }

        // Update categories junction table
        if (category_ids !== undefined) {
            await supabase
                .from('product_categories')
                .delete()
                .eq('product_id', productId)

            if (category_ids.length > 0) {
                const categoryAssociations = category_ids.map((categoryId: string) => ({
                    product_id: productId,
                    category_id: categoryId
                }))

                const { error: categoriesError } = await supabase
                    .from('product_categories')
                    .insert(categoryAssociations)

                if (categoriesError) {
                    logger.error('Error updating categories', categoriesError)
                }
            }
        }

        // Update subcategories junction table
        if (subcategory_ids !== undefined) {
            await supabase
                .from('product_subcategories')
                .delete()
                .eq('product_id', productId)

            if (subcategory_ids.length > 0) {
                const subcategoryAssociations = subcategory_ids.map((subcategoryId: string) => ({
                    product_id: productId,
                    subcategory_id: subcategoryId
                }))

                const { error: subcategoriesError } = await supabase
                    .from('product_subcategories')
                    .insert(subcategoryAssociations)

                if (subcategoriesError) {
                    logger.error('Error updating subcategories', subcategoriesError)
                }
            }
        }

        revalidatePath('/admin/products')
        revalidatePath(`/admin/products/${productId}`)

        return { success: true, data: updatedProduct }
    } catch (error: any) {
        logger.error('Error in updateProduct', error)
        return { success: false, error: error.message || 'Failed to update product' }
    }
}

/**
 * Delete product
 */
export async function deleteProduct(id: string): Promise<ActionResult> {
    try {
        const supabase = await createServerSupabase()

        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id)

        if (error) {
            logger.error('Error deleting product', error)
            throw new Error('Failed to delete product')
        }

        revalidatePath('/admin/products')
        return { success: true }
    } catch (error: any) {
        logger.error('Error in deleteProduct', error)
        return { success: false, error: error.message }
    }
}

/**
 * Bulk delete products
 */
export async function bulkDeleteProducts(productIds: string[]): Promise<ActionResult> {
    const supabase = await createServerSupabase()

    const { error } = await supabase
        .from('products')
        .delete()
        .in('id', productIds)

    if (error) {
        logger.error('Error bulk deleting products', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    return { success: true }
}

/**
 * Bulk update product status
 */
export async function bulkUpdateProductStatus(productIds: string[], status: string): Promise<ActionResult> {
    const supabase = await createServerSupabase()

    const { error } = await supabase
        .from('products')
        .update({ status, updated_at: new Date().toISOString() })
        .in('id', productIds)

    if (error) {
        logger.error('Error bulk updating product status', error)
        return { success: false, error: error.message }
    }

    revalidatePath('/admin/products')
    return { success: true }
}


