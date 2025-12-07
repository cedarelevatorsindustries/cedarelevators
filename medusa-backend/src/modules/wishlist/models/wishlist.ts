import { model } from "@medusajs/framework/utils"

export const Wishlist = model.define("wishlist", {
  id: model.id().primaryKey(),
  customer_id: model.text().nullable(),
  session_id: model.text().nullable(),
  items: model.hasMany(() => WishlistItem, {
    mappedBy: "wishlist",
  }),
  created_at: model.dateTime().default("now"),
  updated_at: model.dateTime().default("now"),
})
  .indexes([
    {
      on: ["customer_id"],
    },
    {
      on: ["session_id"],
    },
  ])

export const WishlistItem = model.define("wishlist_item", {
  id: model.id().primaryKey(),
  wishlist_id: model.text(),
  wishlist: model.belongsTo(() => Wishlist, {
    mappedBy: "items",
  }),
  variant_id: model.text(),
  product_id: model.text(),
  title: model.text(),
  thumbnail: model.text().nullable(),
  price: model.number(),
  quantity: model.number().default(1),
  created_at: model.dateTime().default("now"),
})
  .indexes([
    {
      on: ["variant_id"],
    },
    {
      on: ["wishlist_id"],
    },
  ])
