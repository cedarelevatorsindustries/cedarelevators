import { defineLink } from "@medusajs/framework/utils"
import QuoteModule from "../modules/quote"
import OrderModule from "@medusajs/medusa/order"

export default defineLink(QuoteModule.linkable.quote, OrderModule.linkable.orderChange)
