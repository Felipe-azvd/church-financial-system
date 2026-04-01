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
          where: { email: credentials.email }
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

        const userReturn = {
          id: user.id,
          name: user.nome,
          email: user.email,
          igreja_id: user.igreja_id
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
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.igreja_id = user.igreja_id
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.igreja_id = token.igreja_id as string
      }
      return session
    }
  },

  pages: {
    signIn: "/login"
  },

  secret: process.env.NEXTAUTH_SECRET
}