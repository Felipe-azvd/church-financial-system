import { prismaTenant as prisma } from "@/lib/prisma-tenant"
import { getSessionUser } from "@/lib/auth"

export type CreateLancamentoDTO = {
  descricao: string
  valor: number
  data: Date
  tipo: string
  categoria_id?: string | null
  culto_id?: string | null
}

export type UpdateLancamentoDTO = Partial<CreateLancamentoDTO>

export async function criarLancamento(data: CreateLancamentoDTO) {
  const user = await getSessionUser()
  if (!user || !user.id) throw new Error("Usuário não autenticado")
  const userId = user.id
  return await prisma.transacao.create({
    data: {
      igreja_id: 'auto', // Overridden by Prisma Tenant extension automatically
      usuario_id: userId,
      descricao: data.descricao,
      valor: data.valor,
      data: data.data,
      tipo: data.tipo,
      categoria_id: data.categoria_id,
      culto_id: data.culto_id
    }
  })
}

export async function listarLancamentos(startDate: Date, endDate: Date) {
  return await prisma.transacao.findMany({
    where: { 
      data: {
        gte: startDate,
        lte: endDate
      }
    },
    orderBy: { data: 'asc' },
    include: {
      categoria: true,
      culto: true
    }
  })
}

export async function atualizarLancamento(id: string, data: UpdateLancamentoDTO) {
  const result = await prisma.transacao.updateMany({
    where: { 
      id
    },
    data: {
      descricao: data.descricao,
      valor: data.valor,
      data: data.data,
      tipo: data.tipo,
      categoria_id: data.categoria_id,
      culto_id: data.culto_id
    }
  })
  
  if (result.count === 0) {
    throw new Error("Lançamento não encontrado ou acesso não autorizado.")
  }
  
  return true
}

export async function deletarLancamento(id: string) {
  const result = await prisma.transacao.deleteMany({
    where: { 
      id
    }
  })
  
  if (result.count === 0) {
    throw new Error("Lançamento não encontrado ou acesso não autorizado.")
  }
  
  return true
}

export async function obterResumoFinanceiro(startDate: Date, endDate: Date) {
  const entradas = await prisma.transacao.aggregate({
    _sum: { valor: true },
    where: { tipo: "ENTRADA", data: { gte: startDate, lte: endDate } }
  })

  const saidas = await prisma.transacao.aggregate({
    _sum: { valor: true },
    where: { tipo: "SAIDA", data: { gte: startDate, lte: endDate } }
  })

  return {
    entradas: entradas._sum.valor || 0,
    saidas: saidas._sum.valor || 0,
    saldo: (entradas._sum.valor || 0) - (saidas._sum.valor || 0)
  }
}

export async function listarEntradasPorCategoria(startDate: Date, endDate: Date) {
  const grouped = await prisma.transacao.groupBy({
    by: ["categoria_id"],
    _sum: { valor: true },
    where: {
      tipo: "ENTRADA",
      categoria_id: { not: null },
      data: { gte: startDate, lte: endDate }
    }
  })

  const categoryIds = grouped.map((g) => g.categoria_id as string)
  const categories = await prisma.categoria.findMany({
    where: { id: { in: categoryIds } }
  })

  return grouped.map(g => {
    const cat = categories.find(c => c.id === g.categoria_id)
    return {
      category: cat ? cat.nome : "Desconhecida",
      total: g._sum.valor || 0
    }
  }).sort((a, b) => b.total - a.total)
}

export async function listarSaidasPorCategoria(startDate: Date, endDate: Date) {
  const grouped = await prisma.transacao.groupBy({
    by: ["categoria_id"],
    _sum: { valor: true },
    where: {
      tipo: "SAIDA",
      categoria_id: { not: null },
      data: { gte: startDate, lte: endDate }
    }
  })

  const categoryIds = grouped.map((g) => g.categoria_id as string)
  const categories = await prisma.categoria.findMany({
    where: { id: { in: categoryIds } }
  })

  return grouped.map(g => {
    const cat = categories.find(c => c.id === g.categoria_id)
    return {
      category: cat ? cat.nome : "Desconhecida",
      total: g._sum.valor || 0
    }
  }).sort((a, b) => b.total - a.total)
}

export async function listarEntradasPorCulto(startDate: Date, endDate: Date) {
  const grouped = await prisma.transacao.groupBy({
    by: ["culto_id"],
    _sum: { valor: true },
    where: {
      tipo: "ENTRADA",
      culto_id: { not: null },
      data: { gte: startDate, lte: endDate }
    }
  })

  const cultoIds = grouped.map((g) => g.culto_id as string)
  const cultos = await prisma.culto.findMany({
    where: { id: { in: cultoIds } }
  })

  return grouped.map(g => {
    const cultoObj = cultos.find(c => c.id === g.culto_id)
    return {
      culto: cultoObj ? cultoObj.nome : "Desconhecido",
      total: g._sum.valor || 0
    }
  }).sort((a, b) => b.total - a.total)
}

export async function obterTotaisMensais(ano: number) {
  const promises = []
  for (let i = 0; i < 12; i++) {
    const mStart = new Date(ano, i, 1)
    const mEnd = new Date(ano, i + 1, 0, 23, 59, 59, 999)

    promises.push(
      prisma.transacao.aggregate({
        _sum: { valor: true },
        where: { tipo: 'ENTRADA', data: { gte: mStart, lte: mEnd } }
      }),
      prisma.transacao.aggregate({
        _sum: { valor: true },
        where: { tipo: 'SAIDA', data: { gte: mStart, lte: mEnd } }
      })
    )
  }

  const results = await Promise.all(promises)
  const monthlyTotals = []

  for (let i = 0; i < 12; i++) {
    monthlyTotals.push({
      entradas: results[i * 2]._sum.valor || 0,
      saidas: results[i * 2 + 1]._sum.valor || 0
    })
  }
  return monthlyTotals
}

export async function obterEvolucaoMensal() {
  const user = await getSessionUser()
  if (!user || !user.igreja_id) throw new Error("Usuário não autenticado ou sem igreja associada")
  const igreja_id = user.igreja_id

  const results = await prisma.$queryRaw`
    SELECT 
      EXTRACT(YEAR FROM data) as year,
      EXTRACT(MONTH FROM data) as month,
      SUM(valor) as total
    FROM transacoes
    WHERE igreja_id = ${igreja_id} AND tipo = 'ENTRADA'
    GROUP BY year, month
    ORDER BY year ASC, month ASC
  `
  
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
  
  return (results as any[]).map((r: any) => ({
    month: `${monthNames[r.month - 1]}/${r.year}`,
    total: Number(r.total || 0)
  }))
}
