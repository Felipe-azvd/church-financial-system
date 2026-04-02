import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        console.log("CREDENTIALS:", credentials)

        if (!credentials?.email || !credentials?.password) {
          console.log("❌ Credenciais ausentes")
          return null
        }

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: { role: true } // 🔥 OBRIGATÓRIO: Traz a tabela Role junto!
        })

        console.log("USER:", user)

        if (!user) {
          console.log("❌ Usuário não encontrado")
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.senha
        )

        console.log("PASSWORD OK:", isValid)

        if (!isValid) {
          console.log("❌ Senha inválida")
          return null
        }

        // 🔥 O TypeScript exige que role e permissions estejam aqui
        // Usamos (user as any) temporariamente para evitar falhas caso 
        // os nomes no Prisma divirjam levemente (ex: 'cargo' em vez de 'role')
        const cargo = user.role?.nome || "MEMBRO";
        
        const userReturn = {
          id: user.id,
          name: user.nome,
          email: user.email,
          igreja_id: user.igreja_id,
          role: cargo,
          // 🔥 A INJEÇÃO: Se for MASTER, ganha um coringa. Senão, array vazio (ou permissões reais).
          permissions: cargo === "MASTER" ? ["*"] : []
        }

        console.log("✅ RETORNANDO USER:", userReturn)

        return userReturn
      }
    })
  ],

  session: {
    strategy: "jwt"
  },

  callbacks: {
    // 🔥 1. Repassando os novos campos para o Token do navegador
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.igreja_id = user.igreja_id
        token.role = user.role
        token.permissions = user.permissions
      }
      return token
    },

    // 🔥 2. Injetando os campos do Token para a Sessão ativa
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.igreja_id = token.igreja_id as string
        session.user.role = token.role as string
        session.user.permissions = token.permissions as string[]
      }
      return session
    }
  },

  pages: {
    signIn: "/login"
  },

  secret: process.env.NEXTAUTH_SECRET
}