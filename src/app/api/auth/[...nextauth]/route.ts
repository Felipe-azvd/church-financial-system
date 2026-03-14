import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        senha: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) {
          return null
        }

        const user = await prisma.usuario.findUnique({
          where: { email: credentials.email },
          include: { 
            role: { 
              include: { 
                role_permissions: { include: { permission: true } } 
              } 
            } 
          }
        })

        if (!user || !user.role) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.senha, user.senha)

        if (!isPasswordValid) {
          return null
        }

        const permissions = user.role.role_permissions.map((rp: any) => rp.permission.key)

        return {
          id: user.id,
          email: user.email,
          name: user.nome,
          perfil: user.role.nome,
          igreja_id: user.igreja_id,
          permissions
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.perfil = user.perfil
        token.igreja_id = user.igreja_id
        token.permissions = user.permissions || []
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.perfil = token.perfil as string
        session.user.igreja_id = token.igreja_id as string
        session.user.permissions = token.permissions as string[]
      }
      return session
    }
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
