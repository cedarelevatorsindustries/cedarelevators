import { 
  defineMiddlewares,
  validateAndTransformBody,
  validateAndTransformQuery,
  authenticate 
} from "@medusajs/framework/http"
import { CreateQuote, GetQuoteParams } from "./store/validators"
import { AdminGetQuoteParams } from "./admin/validators"
import { 
  retrieveStoreQuoteQueryConfig, 
  listStoreQuoteQueryConfig 
} from "./store/customers/me/quotes/query-config"
import { 
  retrieveAdminQuoteQueryConfig, 
  listAdminQuoteQueryConfig 
} from "./admin/quotes/query-config"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/payment-methods/:account_holder_id",
      middlewares: [authenticate("customer", ["session", "bearer"])],
    },
    {
      matcher: "/store/customers/sync-role",
      middlewares: [],
    },
    {
      matcher: "/store/customers/me/quotes",
      method: "POST",
      middlewares: [
        validateAndTransformBody(CreateQuote),
        validateAndTransformQuery(
          GetQuoteParams,
          retrieveStoreQuoteQueryConfig
        ),
      ],
    },
    {
      matcher: "/store/customers/me/quotes/:id*",
      middlewares: [
        validateAndTransformQuery(
          GetQuoteParams,
          retrieveStoreQuoteQueryConfig
        ),
      ],
    },
    {
      matcher: "/admin/quotes",
      method: "GET",
      middlewares: [
        validateAndTransformQuery(
          AdminGetQuoteParams,
          listAdminQuoteQueryConfig
        ),
      ],
    },
    {
      matcher: "/admin/quotes/:id*",
      middlewares: [
        validateAndTransformQuery(
          AdminGetQuoteParams,
          retrieveAdminQuoteQueryConfig
        ),
      ],
    },
  ],
})
