import { MedusaService } from "@medusajs/framework/utils"

class WishlistService extends MedusaService({
  Wishlist: {},
  WishlistItem: {},
}) {
  async getOrCreate(customerId?: string, sessionId?: string) {
    const wishlistRepo = this.container.resolve("wishlistRepository")
    
    let wishlist
    if (customerId) {
      wishlist = await wishlistRepo.findOne({ 
        where: { customer_id: customerId },
        relations: ["items"]
      })
    } else if (sessionId) {
      wishlist = await wishlistRepo.findOne({ 
        where: { session_id: sessionId },
        relations: ["items"]
      })
    }

    if (!wishlist) {
      wishlist = await wishlistRepo.create({
        customer_id: customerId || null,
        session_id: sessionId || null,
      })
    }

    return wishlist
  }

  async addItem(
    variantId: string,
    productId: string,
    title: string,
    thumbnail: string | null,
    price: number,
    customerId?: string,
    sessionId?: string
  ) {
    const wishlist = await this.getOrCreate(customerId, sessionId)
    const itemRepo = this.container.resolve("wishlistItemRepository")

    let item = await itemRepo.findOne({
      where: { 
        wishlist_id: wishlist.id, 
        variant_id: variantId 
      },
    })

    if (item) {
      item.quantity += 1
      await itemRepo.save(item)
    } else {
      item = await itemRepo.create({
        wishlist_id: wishlist.id,
        variant_id: variantId,
        product_id: productId,
        title,
        thumbnail,
        price,
        quantity: 1,
      })
    }

    return await this.getOrCreate(customerId, sessionId)
  }

  async removeItem(
    variantId: string,
    customerId?: string,
    sessionId?: string
  ) {
    const wishlist = await this.getOrCreate(customerId, sessionId)
    const itemRepo = this.container.resolve("wishlistItemRepository")

    await itemRepo.delete({ 
      wishlist_id: wishlist.id, 
      variant_id: variantId 
    })

    return await this.getOrCreate(customerId, sessionId)
  }

  async list(customerId?: string, sessionId?: string) {
    const wishlist = await this.getOrCreate(customerId, sessionId)
    const itemRepo = this.container.resolve("wishlistItemRepository")

    return await itemRepo.find({ 
      where: { wishlist_id: wishlist.id } 
    })
  }

  async merge(sessionId: string, customerId: string) {
    const wishlistRepo = this.container.resolve("wishlistRepository")
    const itemRepo = this.container.resolve("wishlistItemRepository")

    const sessionWishlist = await wishlistRepo.findOne({
      where: { session_id: sessionId },
      relations: ["items"]
    })

    if (!sessionWishlist) return

    const sessionItems = await itemRepo.find({ 
      where: { wishlist_id: sessionWishlist.id } 
    })

    for (const item of sessionItems) {
      await this.addItem(
        item.variant_id,
        item.product_id,
        item.title,
        item.thumbnail,
        item.price,
        customerId
      )
    }

    await wishlistRepo.delete(sessionWishlist.id)
  }

  async count(customerId?: string, sessionId?: string) {
    const items = await this.list(customerId, sessionId)
    return items.length
  }
}

export default WishlistService
