import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seed process...')

  // 1. Create or ensure initial church exists
  let igreja = await prisma.igreja.findFirst({
    where: { nome: 'Igreja Sede' }
  })
  if (!igreja) {
    igreja = await prisma.igreja.create({
      data: {
        nome: 'Igreja Sede',
        cidade: 'São Paulo',
      },
    })
    console.log('Created Igreja Sede')
  }

  // 2. Ensure Permissions exist
  const systemPermissions = [
    { key: 'dashboard.visualizar', description: 'Visualizar Dashboard' },
    { key: 'lancamentos.visualizar', description: 'Visualizar Lançamentos' },
    { key: 'lancamentos.criar', description: 'Criar Lançamentos' },
    { key: 'lancamentos.editar', description: 'Editar Lançamentos' },
    { key: 'lancamentos.excluir', description: 'Excluir Lançamentos' },
    { key: 'relatorios.visualizar', description: 'Visualizar Relatórios' },
    { key: 'usuarios.visualizar', description: 'Visualizar Usuários' },
    { key: 'usuarios.criar', description: 'Criar Usuários' },
    { key: 'usuarios.editar', description: 'Editar Usuários' },
    { key: 'usuarios.excluir', description: 'Excluir Usuários' },
    { key: 'funcoes.visualizar', description: 'Visualizar Funções' },
    { key: 'funcoes.criar', description: 'Criar Funções' },
    { key: 'funcoes.editar', description: 'Editar Funções' },
    { key: 'funcoes.excluir', description: 'Excluir Funções' },
    { key: 'configuracoes.visualizar', description: 'Visualizar Configurações' },
    { key: 'configuracoes.editar', description: 'Editar Configurações' },
  ]

  for (const p of systemPermissions) {
    await prisma.permission.upsert({
      where: { key: p.key },
      update: { description: p.description },
      create: p
    })
  }

  const allPermissions = await prisma.permission.findMany()

  // 3. Ensure default roles exist with specific permissions
  const defaultRoles = ['ADMINISTRADOR', 'TESOUREIRO', 'VISUALIZADOR']
  for (const roleName of defaultRoles) {
    let role = await prisma.role.findFirst({
      where: { nome: roleName, igreja_id: igreja.id }
    })
    if (!role) {
      role = await prisma.role.create({
        data: { nome: roleName, igreja_id: igreja.id }
      })
      console.log(`Created Role: ${roleName}`)
    }

    // Assign specific permissions to these roles
    let keysToAssign: string[] = []
    
    if (roleName === 'ADMINISTRADOR') {
      keysToAssign = systemPermissions.map(p => p.key)
    } else if (roleName === 'TESOUREIRO') {
      keysToAssign = [
        'dashboard.visualizar', 
        'lancamentos.visualizar', 'lancamentos.criar', 'lancamentos.editar', 'lancamentos.excluir',
        'relatorios.visualizar'
      ]
    } else if (roleName === 'VISUALIZADOR') {
      keysToAssign = ['dashboard.visualizar']
    }

    // Connect them
    const permsToConnect = allPermissions.filter(p => keysToAssign.includes(p.key))
    
    for (const p of permsToConnect) {
      const existingLink = await prisma.rolePermission.findUnique({
        where: { role_id_permission_id: { role_id: role.id, permission_id: p.id } }
      })
      if (!existingLink) {
        await prisma.rolePermission.create({
          data: { role_id: role.id, permission_id: p.id }
        })
      }
    }
  }

  const adminRole = await prisma.role.findFirst({
    where: { nome: 'ADMINISTRADOR', igreja_id: igreja.id }
  })

  if (!adminRole) {
    throw new Error('Administrador role could not be created or found.')
  }

  // 3. Ensure admin user exists
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const adminEmail = 'felipeabreu.1994@gmail.com'
  let admin = await prisma.usuario.findUnique({
    where: { email: adminEmail }
  })

  if (!admin) {
    admin = await prisma.usuario.create({
      data: {
        nome: 'Felipe Azevedo',
        email: adminEmail,
        senha: hashedPassword,
        role_id: adminRole.id,
        igreja_id: igreja.id,
      },
    })
    console.log('Created Admin User (Felipe Azevedo)')
  } else {
    // Ensure role sync without overwriting the password
    await prisma.usuario.update({
      where: { id: admin.id },
      data: { role_id: adminRole.id }
    })
    console.log('Updated Admin User role for Felipe Azevedo')
  }



  // 4. Ensure Default Categories exist
  const categoriasEntrada = [
    'Dízimo', 'Oferta', 'Doação', 'Oferta Especial',
    'Contribuição Missionária', 'Venda de Produtos', 
    'Doação Online', 'Transferência Recebida'
  ]
  const categoriasSaida = [
    'Aluguel', 'Energia', 'Água', 'Internet', 'Manutenção',
    'Material de Culto', 'Equipamentos', 'Missões', 'Ajuda Social',
    'Limpeza', 'Impostos / Taxas'
  ]
  const categoriasAmbos = [
    'Eventos', 'Transferências', 'Ajustes Financeiros'
  ]

  const upsertCategoria = async (nome: string, tipo: string) => {
    const exists = await prisma.categoria.findFirst({
      where: { nome, igreja_id: igreja.id }
    })
    if (!exists) {
      await prisma.categoria.create({
        data: { nome, tipo, igreja_id: igreja.id }
      })
      console.log(`Created Categoria: ${nome} (${tipo})`)
    }
  }

  for (const c of categoriasEntrada) await upsertCategoria(c, 'ENTRADA')
  for (const c of categoriasSaida) await upsertCategoria(c, 'SAIDA')
  for (const c of categoriasAmbos) await upsertCategoria(c, 'AMBOS')

  // 5. Ensure Default Cultos exist
  const defaultCultos = [
    'Domingo Manhã', 'Domingo Noite', 'Quarta-feira', 
    'Culto de Oração', 'Vigília'
  ]
  for (const c of defaultCultos) {
    const exists = await prisma.culto.findFirst({
      where: { nome: c, igreja_id: igreja.id }
    })
    if (!exists) {
      await prisma.culto.create({
        data: { nome: c, igreja_id: igreja.id }
      })
      console.log(`Created Culto: ${c}`)
    }
  }

  console.log('Seed completed successfully.')
  console.log('Admin Email: felipeabreu.1994@gmail.com')
  console.log('(Se a conta foi criada agora, a senha padrão é: admin123)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
