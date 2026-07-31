import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Tenant de demonstração usado para apresentações a clientes.
// Trava de segurança abaixo garante que este script nunca apague dados de outro tenant.
const DEMO_TENANT_ID = 'cmo34cv2e00000piizufuy8ho'
const DEMO_TENANT_NOME_ESPERADO = 'Comunidade Cristã'

function getRandomDate(daysBack: number) {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
  return date
}

function getRandomValue(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

async function main() {
  console.log(`🔄 Atualizando dados de demonstração do tenant: ${DEMO_TENANT_ID}`)

  const igreja = await prisma.igreja.findUnique({ where: { id: DEMO_TENANT_ID } })

  if (!igreja || igreja.nome !== DEMO_TENANT_NOME_ESPERADO) {
    throw new Error(
      `Trava de segurança ativada: tenant ${DEMO_TENANT_ID} não corresponde ao esperado ("${DEMO_TENANT_NOME_ESPERADO}"). Abortando sem apagar nada.`
    )
  }

  const membros = await prisma.usuario.findMany({ where: { igreja_id: DEMO_TENANT_ID, is_master: false } })
  const categoriasEntrada = await prisma.categoria.findMany({ where: { igreja_id: DEMO_TENANT_ID, tipo: 'ENTRADA' } })
  const categoriasSaida = await prisma.categoria.findMany({ where: { igreja_id: DEMO_TENANT_ID, tipo: 'SAIDA' } })
  const cultos = await prisma.culto.findMany({ where: { igreja_id: DEMO_TENANT_ID } })

  if (membros.length === 0 || categoriasEntrada.length === 0 || categoriasSaida.length === 0 || cultos.length === 0) {
    throw new Error('Tenant de demonstração não tem membros/categorias/cultos suficientes para gerar transações. Rode prisma/seed-demo.ts primeiro.')
  }

  console.log('🧹 Removendo transações antigas do tenant de demonstração...')
  const removidas = await prisma.transacao.deleteMany({ where: { igreja_id: DEMO_TENANT_ID } })
  console.log(`   ${removidas.count} transações removidas.`)

  console.log('💰 Gerando 60 novas transações realistas para os últimos 120 dias...')
  const transacoes: {
    data: Date
    descricao: string
    valor: number
    tipo: string
    categoria_id: string
    culto_id?: string
    igreja_id: string
    usuario_id: string
  }[] = []

  // Entradas (Dízimos e Ofertas)
  for (let i = 0; i < 40; i++) {
    const isDizimo = Math.random() > 0.4
    const categoria = isDizimo ? categoriasEntrada[0] : categoriasEntrada[1 % categoriasEntrada.length]
    const valor = isDizimo ? getRandomValue(300, 1500) : getRandomValue(50, 200)
    const membroAleatorio = membros[Math.floor(Math.random() * membros.length)]
    const cultoAleatorio = cultos[Math.floor(Math.random() * cultos.length)]

    transacoes.push({
      data: getRandomDate(120),
      descricao: `${categoria.nome} - ${membroAleatorio.nome}`,
      valor,
      tipo: 'ENTRADA',
      categoria_id: categoria.id,
      culto_id: cultoAleatorio.id,
      igreja_id: DEMO_TENANT_ID,
      usuario_id: membroAleatorio.id,
    })
  }

  // Saídas (Despesas)
  for (let i = 0; i < 20; i++) {
    const categoria = categoriasSaida[Math.floor(Math.random() * categoriasSaida.length)]
    let valor = 0

    if (categoria.nome === 'Aluguel') valor = 2500.0
    else if (categoria.nome === 'Energia Elétrica') valor = getRandomValue(300, 600)
    else if (categoria.nome === 'Internet') valor = 120.0
    else valor = getRandomValue(100, 800)

    transacoes.push({
      data: getRandomDate(120),
      descricao: `Pagamento de ${categoria.nome}`,
      valor,
      tipo: 'SAIDA',
      categoria_id: categoria.id,
      igreja_id: DEMO_TENANT_ID,
      usuario_id: membros[0].id,
    })
  }

  await prisma.transacao.createMany({ data: transacoes })

  console.log(`✅ ${transacoes.length} novas transações criadas. Dados de demonstração renovados com sucesso.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
