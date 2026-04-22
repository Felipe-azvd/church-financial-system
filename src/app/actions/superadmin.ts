'use server'

import { registrarLog } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/auth"
import { hash } from "bcryptjs"
import { revalidatePath } from "next/cache"
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function criarNovaIgreja(formData: FormData) {
  const user = await getCurrentUser()
  
  if (!user || !user.permissions.includes('*')) {
    return { success: false, error: 'Acesso negado. Apenas o Super Admin pode executar esta ação.' }
  }

  const nomeIgreja = formData.get('nomeIgreja') as string
  const nomeAdmin = formData.get('nomeAdmin') as string
  const emailAdmin = formData.get('emailAdmin') as string
  const senhaAdmin = formData.get('senhaAdmin') as string

  if (!nomeIgreja || !nomeAdmin || !emailAdmin || !senhaAdmin) {
    return { success: false, error: 'Preencha todos os campos obrigatórios.' }
  }

  try {
    const emailExiste = await prisma.usuario.findUnique({ where: { email: emailAdmin } })
    if (emailExiste) return { success: false, error: 'Este e-mail já está em uso.' }

    const senhaHash = await hash(senhaAdmin, 10)

    // Inicia a Transação: Tudo ou nada!
    await prisma.$transaction(async (tx) => {
      
      const novaIgreja = await tx.igreja.create({
        data: { nome: nomeIgreja, ativo: true }
      })

      const todasPermissoes = await tx.permission.findMany()

      const roleAdmin = await tx.role.create({ data: { nome: 'Administrador', igreja_id: novaIgreja.id } })
      const roleTesouraria = await tx.role.create({ data: { nome: 'Tesouraria', igreja_id: novaIgreja.id } })
      const roleMembro = await tx.role.create({ data: { nome: 'Membro', igreja_id: novaIgreja.id } })

      // 🔥 Bloqueia a permissão '*' de ser entregue para administradores comuns
     const permissoesAdmin = todasPermissoes
        .filter(p => p.key !== '*') 
        .map(p => ({ role_id: roleAdmin.id, permission_id: p.id }))
      const permissoesTesouraria = todasPermissoes
        .filter(p => p.key.includes('lancamento') || p.key.includes('relatorio') || p.key.includes('dashboard'))
        .map(p => ({ role_id: roleTesouraria.id, permission_id: p.id }))
      const permissoesMembro = todasPermissoes
        .filter(p => (p.key.includes('dashboard') || p.key.includes('relatorio')) && p.key.includes('visualizar'))
        .map(p => ({ role_id: roleMembro.id, permission_id: p.id }))

      await tx.rolePermission.createMany({ 
        data: [...permissoesAdmin, ...permissoesTesouraria, ...permissoesMembro] 
      })

      await tx.usuario.create({
        data: {
          nome: nomeAdmin, email: emailAdmin, senha: senhaHash,
          igreja_id: novaIgreja.id, role_id: roleAdmin.id,
          is_master: true, is_superadmin: false 
        }
      })
      
      await tx.categoria.createMany({
        data: [
          { nome: 'Dízimo', tipo: 'ENTRADA', igreja_id: novaIgreja.id },
          { nome: 'Ofertas de Culto', tipo: 'ENTRADA', igreja_id: novaIgreja.id },
          { nome: 'Ofertas Especiais/Propósitos', tipo: 'ENTRADA', igreja_id: novaIgreja.id },
          { nome: 'Doações Diversas', tipo: 'ENTRADA', igreja_id: novaIgreja.id },
          { nome: 'Missões', tipo: 'ENTRADA', igreja_id: novaIgreja.id },
          { nome: 'Eventos', tipo: 'AMBOS', igreja_id: novaIgreja.id },
          { nome: 'Cantina', tipo: 'AMBOS', igreja_id: novaIgreja.id },
          { nome: 'Aluguel', tipo: 'SAIDA', igreja_id: novaIgreja.id },
          { nome: 'Manutenção e Limpeza', tipo: 'SAIDA', igreja_id: novaIgreja.id },
          { nome: 'Ação Social', tipo: 'SAIDA', igreja_id: novaIgreja.id },
          { nome: 'Água', tipo: 'SAIDA', igreja_id: novaIgreja.id },
          { nome: 'Luz', tipo: 'SAIDA', igreja_id: novaIgreja.id },
          { nome: 'Internet', tipo: 'SAIDA', igreja_id: novaIgreja.id },
          { nome: 'Despesas Administrativas', tipo: 'SAIDA', igreja_id: novaIgreja.id }
        ]
      })

      await tx.culto.createMany({
        data: [
          { nome: 'Domingo manhã (EBD)', igreja_id: novaIgreja.id },
          { nome: 'Domingo noite (louvor e adoração)', igreja_id: novaIgreja.id },
          { nome: 'Terça-feira (Culto da família)', igreja_id: novaIgreja.id },
          { nome: 'Quinta-feira (Culto de libertação)', igreja_id: novaIgreja.id },
          { nome: 'Sábado (consagração)', igreja_id: novaIgreja.id }
        ]
      })
    })

    await registrarLog("CRIAR_IGREJA_TENANT", `Nova igreja ${nomeIgreja} criada`, "Igreja", null)
    revalidatePath('/super-admin')
    return { success: true }
    
  } catch (error: any) {
    console.error("Erro ao criar tenant:", error)
    return { success: false, error: 'Ocorreu um erro interno ao configurar a nova igreja.' }
  }
}

export async function alternarStatusIgreja(igrejaId: string, novoStatus: boolean) {
  const user = await getCurrentUser()
  
  // Confirma que só o Master pode fazer isso
  if (!user || !user.permissions.includes('*')) {
    return { success: false, error: 'Acesso negado.' }
  }

  try {
    await prisma.igreja.update({
      where: { id: igrejaId },
      data: { ativo: novoStatus }
    })
    
    await registrarLog("ALTERAR_STATUS_IGREJA", `Status da igreja alterado para ${novoStatus}`, "Igreja", igrejaId)
    revalidatePath('/super-admin')
    return { success: true }
  } catch (error) {
    console.error("Erro ao alterar status:", error)
    return { success: false, error: 'Erro ao alterar o status da igreja.' }
  }
}

export async function acessarIgrejaCliente(igrejaId: string) {
  const user = await getCurrentUser()
  
  if (!user || !user.permissions.includes('*')) {
    return { success: false, error: 'Acesso negado.' }
  }

  // 1. Pega o controle de cookies do navegador
  const cookieStore = await cookies()
  
  // 2. Grava o ID da igreja do cliente no seu navegador
  cookieStore.set('master_tenant_id', igrejaId, { 
    path: '/',
    maxAge: 60 * 60 * 24 // Dura 24 horas
  })

  // 3. Redireciona você para o Dashboard, mas agora vendo os dados do cliente!
  await registrarLog("ACESSAR_IGREJA_CLIENTE", `Master acessou a igreja ${igrejaId}`, "Igreja", igrejaId)
  return { success: true }
}

export async function sairModoSuporte() {
  const cookieStore = await cookies()
  
  // Apaga o rastro do teletransporte
  cookieStore.delete('master_tenant_id')
  
  await registrarLog("SAIR_MODO_SUPORTE", `Master encerrou acesso de suporte`, "Usuario", null)
  // Revalida tudo e volta para a central
  revalidatePath('/')
  redirect('/super-admin')
}

export async function alterarPlanoIgreja(igrejaId: string, novoPlano: string, novoVencimento?: number) {
  try {
    const igrejaAnterior = await prisma.igreja.findUnique({
      where: { id: igrejaId },
      select: { plano: true }
    });

    const igrejaAtualizada = await prisma.igreja.update({
      where: { id: igrejaId },
      data: { 
        plano: novoPlano,
        ...(novoVencimento && { dia_vencimento: novoVencimento })
      }
    });

    // 🔥 REGISTRO NA AUDITORIA QUE CRIAMOS
    await registrarLog(
      "UPGRADE_PLANO",
      `Plano alterado de ${igrejaAnterior?.plano} para ${novoPlano}`,
      "Igreja",
      igrejaId
    );

    revalidatePath('/super-admin/financeiro');
    revalidatePath('/super-admin/igrejas');
    
    return { success: true };
  } catch (error) {
    return { success: false, error: "Falha ao atualizar plano." };
  }
}