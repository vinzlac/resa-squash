import { AuthOptions, User } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { authenticateUser, ensureLicenseesMapByUserIdIsInitialized } from '@/app/services/common';

interface CustomUser extends User {
  accessToken: string;
}

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }
}

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email et mot de passe requis');
        }

        try {
          const response = await authenticateUser(credentials.email, credentials.password);
          
          // Initialiser la map après une authentification réussie
          console.log("🔄 Initialisation de la map des licenciés après authentification...");
          await ensureLicenseesMapByUserIdIsInitialized(response.token);
          console.log("✅ Map des licenciés initialisée avec succès");
          
          return {
            id: response.userId,
            email: response.user.email,
            name: response.user.firstName + ' ' + response.user.lastName,
            accessToken: response.token
          } as CustomUser;
        } catch (error) {
          console.error('Erreur d\'authentification:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as CustomUser).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    }
  },
  pages: {
    signIn: '/auth/signin',
  },
  session: {
    strategy: 'jwt' as const,
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 