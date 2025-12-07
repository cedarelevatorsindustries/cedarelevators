import { defineLink } from "@medusajs/framework/utils"
import QuoteModule from "../modules/quote"
import CartModule from "@medusajs/medusa/cart"

export default defineLink(QuoteModule.linkable.quote, CartModule.linkable.cart)
