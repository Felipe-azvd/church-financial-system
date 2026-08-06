import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const basePrisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = basePrisma

// O Neon (banco em produção) hiberna após alguns minutos de inatividade —
// a primeira query após esse período pode falhar enquanto o compute
// "acorda". Repete automaticamente erros transitórios de conexão antes de
// propagar o erro pro chamador.
const RETRYABLE_CODES = new Set(['P1001', 'P1008', 'P1017'])

function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) return true
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return RETRYABLE_CODES.has(error.code)
  }
  return false
}

async function withConnectionRetry<T>(run: () => Promise<T>, retries = 3, baseDelayMs = 500): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await run()
    } catch (error) {
      if (attempt >= retries || !isRetryableError(error)) throw error
      await new Promise((resolve) => setTimeout(resolve, baseDelayMs * (attempt + 1)))
    }
  }
}

export const prisma = basePrisma.$extends({
  query: {
    $allOperations({ query, args }) {
      return withConnectionRetry(() => query(args))
    }
  }
})
