import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/database/prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { teamMemberships: { select: { teamId: true, role: true } } }
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.teamMemberships[0]?.role,
          teamId: user.teamMemberships[0]?.teamId
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
    error: '/auth/error',
  },
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
        token.teamId = user.teamId;
      } else if (token.sub) {
        const dbUser = await prisma.user.findUnique({
            where: { id: token.sub },
            include: { teamMemberships: { select: { teamId: true, role: true } } }
        });
        if (dbUser) {
            token.role = dbUser.teamMemberships[0]?.role;
            token.teamId = dbUser.teamMemberships[0]?.teamId;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token?.sub && session.user) {
        session.user.id = token.sub;
        session.user.role = token.role;
        session.user.teamId = token.teamId;
      }
      return session;
    },
  },
}; 