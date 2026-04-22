import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// 🔥 PASSO 1: COLE O ID DA SUA IGREJA TESTE A AQUI
const IGREJA_ID = "cmo34cv2e00000piizufuy8ho" 

// Função auxiliar para gerar datas aleatórias nos últimos X dias
function getRandomDate(daysBack: number) {
  const date = new Date()
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack))
  return date
}

// Função auxiliar para gerar valores financeiros
function getRandomValue(min: number, max: number) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2))
}

async function main() {
  if (IGREJA_ID === "COLE_O_ID_AQUI") {
    console.error("❌ ERRO: Você esqueceu de colocar o ID da Igreja na linha 6 do script!")
    process.exit(1)
  }

  console.log(`🌱 Iniciando a criação da Vitrine (Golden Tenant) para a igreja: ${IGREJA_ID}`)

  // 0. PREPARANDO A IGREJA PARA A VENDA (O "Wow Factor")
  console.log('✨ Atualizando o perfil da igreja para a apresentação...')
  await prisma.igreja.update({
    where: { id: IGREJA_ID },
    data: {
      nome: 'Comunidade Cristã', // Nome premium para vendas
      cidade: 'São Paulo', // Adicionando uma cidade para dar mais realismo
      plano: 'PREMIUM', // Garantindo acesso total na demonstração
      ativo: true
    }
  })

  // 1. CRIANDO ROLES BÁSICAS (Se não existirem)
  const roleMembro = await prisma.role.create({
    data: { nome: 'Membro Demonstração', igreja_id: IGREJA_ID }
  })

  // 2. CRIANDO MEMBROS (Usuários)
  console.log('👥 Cadastrando 15 membros de demonstração...')
  const nomesMembros = [
    "João Silva", "Maria Oliveira", "Pedro Santos", "Ana Costa", "Lucas Pereira",
    "Juliana Almeida", "Marcos Rodrigues", "Fernanda Lima", "Rafael Gomes", "Camila Alves",
    "Bruno Fernandes", "Letícia Ribeiro", "Thiago Carvalho", "Beatriz Martins", "Felipe Sousa"
  ]

  const membros = await Promise.all(
    nomesMembros.map(async (nome, index) => {
      return prisma.usuario.create({
        data: {
          nome,
          email: `demo.membro${index + 1}@igreja.com`,
          senha: 'hash_falso_apenas_para_demo', // Eles não vão logar, é só para popular a tabela
          role_id: roleMembro.id,
          igreja_id: IGREJA_ID,
          is_master: false,
        }
      })
    })
  )

  // 3. CRIANDO CATEGORIAS FINANCEIRAS
  console.log('🏷️ Criando categorias de entrada e saída...')
  const categoriasEntrada = await Promise.all([
    prisma.categoria.create({ data: { nome: 'Dízimo', tipo: 'ENTRADA', igreja_id: IGREJA_ID } }),
    prisma.categoria.create({ data: { nome: 'Oferta', tipo: 'ENTRADA', igreja_id: IGREJA_ID } }),
    prisma.categoria.create({ data: { nome: 'Cantina', tipo: 'ENTRADA', igreja_id: IGREJA_ID } })
  ])

  const categoriasSaida = await Promise.all([
    prisma.categoria.create({ data: { nome: 'Aluguel', tipo: 'SAIDA', igreja_id: IGREJA_ID } }),
    prisma.categoria.create({ data: { nome: 'Energia Elétrica', tipo: 'SAIDA', igreja_id: IGREJA_ID } }),
    prisma.categoria.create({ data: { nome: 'Internet', tipo: 'SAIDA', igreja_id: IGREJA_ID } }),
    prisma.categoria.create({ data: { nome: 'Manutenção', tipo: 'SAIDA', igreja_id: IGREJA_ID } })
  ])

  // 4. CRIANDO CULTOS
  console.log('⛪ Criando cultos...')
  const cultos = await Promise.all([
    prisma.culto.create({ data: { nome: 'Culto de Celebração (Domingo)', igreja_id: IGREJA_ID } }),
    prisma.culto.create({ data: { nome: 'Culto de Ensino (Quarta)', igreja_id: IGREJA_ID } }),
    prisma.culto.create({ data: { nome: 'Culto de Jovens (Sábado)', igreja_id: IGREJA_ID } })
  ])

  // 5. CRIANDO TRANSAÇÕES (MÁGICA DOS GRÁFICOS)
  console.log('💰 Gerando 60 transações financeiras realistas para os últimos 120 dias...')
  const transacoes = []

  // Gerar Entradas (Dízimos e Ofertas)
  for (let i = 0; i < 40; i++) {
    const isDizimo = Math.random() > 0.4
    const categoria = isDizimo ? categoriasEntrada[0] : categoriasEntrada[1]
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
      igreja_id: IGREJA_ID,
      usuario_id: membroAleatorio.id
    })
  }

  // Gerar Saídas (Despesas)
  for (let i = 0; i < 20; i++) {
    const categoria = categoriasSaida[Math.floor(Math.random() * categoriasSaida.length)]
    let valor = 0
    
    // Valores realistas baseados na categoria
    if (categoria.nome === 'Aluguel') valor = 2500.00
    else if (categoria.nome === 'Energia Elétrica') valor = getRandomValue(300, 600)
    else if (categoria.nome === 'Internet') valor = 120.00
    else valor = getRandomValue(100, 800)

    transacoes.push({
      data: getRandomDate(120),
      descricao: `Pagamento de ${categoria.nome}`,
      valor,
      tipo: 'SAIDA',
      categoria_id: categoria.id,
      igreja_id: IGREJA_ID,
      usuario_id: membros[0].id // Lançado pelo primeiro usuário
    })
  }

  // Inserir todas as transações no banco
  await prisma.transacao.createMany({
    data: transacoes
  })

  console.log('✅ SUCESSO! A sua "Comunidade Cristã" agora é uma super Vitrine Premium.')
  console.log('📊 Pode abrir o seu dashboard e ver os gráficos voando!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })