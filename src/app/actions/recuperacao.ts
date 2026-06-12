'use server'

import { registrarLog } from "@/lib/logger"
import { prisma } from "@/lib/prisma"
import nodemailer from "nodemailer"
import crypto from "crypto"
import bcrypt from "bcryptjs"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function enviarEmailRecuperacao(email: string) {
  try {
    const user = await prisma.usuario.findUnique({ where: { email } })

    // Por segurança, se o e-mail não existir, fingimos que deu certo para evitar invasores testando e-mails
    if (!user) {
      return { success: true }
    }

    // 1. Gera o Token de 64 caracteres e define validade de 1 hora
    const resetToken = crypto.randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 1000 * 60 * 60)

    // 2. Salva no banco
    await prisma.usuario.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    })

    // 3. Monta o link mágico
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const resetLink = `${baseUrl}/redefinir-senha?token=${resetToken}`

    // 4. Dispara o e-mail
    await transporter.sendMail({
      from: `"ChurchFep Suporte" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Recuperação de Senha - ChurchFep",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0B1121; padding: 40px; border-radius: 10px; color: #fff;">
          <h2 style="color: #10B981; text-align: center;">Recuperação de Senha</h2>
          <p>Olá, ${user.nome}.</p>
          <p>Você solicitou a redefinição da sua senha no ChurchFep. Clique no botão abaixo para criar uma nova senha. Este link é válido por 1 hora.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #10B981; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Redefinir Minha Senha</a>
          </div>
          <p style="font-size: 12px; color: #6B7280; text-align: center;">Se você não solicitou isso, pode ignorar este e-mail com segurança.</p>
        </div>
      `,
    })

    await registrarLog("SOLICITAR_RECUPERACAO_SENHA", `Email de recuperação enviado para ${email}`, "Usuario", user.id)
    return { success: true }
  } catch (error) {
    console.error("Erro ao enviar e-mail:", error)
    return { success: false, error: "Erro interno ao tentar enviar o e-mail." }
  }
}

export async function salvarNovaSenha(token: string, novaSenha: string) {
  try {
    // Procura um usuário com esse token que ainda não expirou
    const user = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    })

    if (!user) {
      return { success: false, error: "Link de recuperação inválido ou expirado." }
    }

    const hashedPassword = await bcrypt.hash(novaSenha, 10)

    // Salva a nova senha e destrói o token para não ser usado novamente
    await prisma.usuario.update({
      where: { id: user.id },
      data: {
        senha: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    await registrarLog("REDEFINIR_SENHA", `Senha redefinida com sucesso`, "Usuario", user.id)
    return { success: true }
  } catch (error) {
    console.error("Erro ao redefinir senha:", error)
    return { success: false, error: "Erro interno ao tentar redefinir a senha." }
  }
}