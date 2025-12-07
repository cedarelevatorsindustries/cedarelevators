import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

export const GET = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse
) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY)

  const { data: quotes, metadata } = await query.graph({
    entity: "quote",
    fields: req.queryConfig.fields,
    filters: req.filterableFields,
    pagination: {
      ...req.queryConfig.pagination,
    },
  })

  res.json({
    quotes,
    count: metadata.count,
    offset: metadata.skip,
    limit: metadata.take,
  })
}
