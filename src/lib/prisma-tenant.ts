import { prisma } from './prisma'
import { getSessionUser } from './auth'

const tenantModels = ['Usuario', 'Role', 'Culto', 'Categoria', 'Transacao']

export const prismaTenant = prisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        if (model && tenantModels.includes(model)) {
          // Wrap session retrieval to catch unauthorized calls
          let sessionUser
          try {
            sessionUser = await getSessionUser()
          } catch (error) {
            throw new Error("Tenant context not found")
          }

          if (!sessionUser || !sessionUser.igrejaId) {
            throw new Error("Tenant context not found")
          }

          const tenantId = sessionUser.igrejaId

          // Block unsafe operations that rely solely on unique IDs without tenant bounds
          const unsafeOperations = ['findUnique', 'findUniqueOrThrow', 'update', 'delete']
          if (unsafeOperations.includes(operation)) {
            throw new Error(`Operação ${operation} bloqueada estruturalmente em modelos Multi-Tenant. Utilize findFirst, updateMany ou deleteMany para manter a segurança do igreja_id.`)
          }

          const queryArgs = args as any
          
          // Inject tenantId into WHERE constraints explicitly
          const readOperations = ['findFirst', 'findFirstOrThrow', 'findMany', 'updateMany', 'deleteMany', 'aggregate', 'groupBy', 'count']
          if (readOperations.includes(operation)) {
            queryArgs.where = { ...(queryArgs.where || {}), igreja_id: tenantId }
          } 
          
          // Inject tenantId into DATA structures on insertions
          else if (['create', 'createMany'].includes(operation)) {
            if (operation === 'create') {
              queryArgs.data = { ...queryArgs.data, igreja_id: tenantId }
            } else if (operation === 'createMany') {
              if (Array.isArray(queryArgs.data)) {
                queryArgs.data = queryArgs.data.map((d: any) => ({ ...d, igreja_id: tenantId }))
              } else {
                queryArgs.data = { ...queryArgs.data, igreja_id: tenantId }
              }
            }
          }
        }

        return query(args as any)
      }
    }
  }
})
