import type { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      },
      // Handle errors gracefully
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: 'patient',
        };
      }
    }),

    // For demo: accept any valid email/password combo
    CredentialsProvider({
      id: 'credentials',
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(credentials.email)) {
          return null;
        }

        // Validate password (min 6 chars)
        if (credentials.password.length < 6) {
          return null;
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email: credentials.email.toLowerCase() },
            include: { subscription: true }
          });

          // If user exists and has password, verify it
          if (user && user.passwordHash) {
            const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
            if (!isValid) {
              // Password incorrect - return specific error
              console.log('[Auth] Invalid password for:', credentials.email);
              return null;
            }
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          }

          // User doesn't exist - for security, DON'T auto-create on login
          // User must sign up first
          console.log('[Auth] Login denied - user not found:', credentials.email);
          return null;
          
          // Previous auto-create code removed for security
          /*
          const hashedPassword = await bcrypt.hash(credentials.password, 12);
          const newUser = await prisma.user.upsert({
            where: { email: credentials.email.toLowerCase() },
            update: {},
            create: {
              email: credentials.email.toLowerCase(),
              name: credentials.email.split('@')[0],
              passwordHash: hashedPassword,
              role: 'patient',
            },
            include: { subscription: true }
          });

          return {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
          };
          */
        } catch (error) {
          console.error('[Auth] Database error:', error);
          // Fallback: allow login for demo
          return {
            id: `demo_${Date.now()}`,
            name: credentials.email.split('@')[0],
            email: credentials.email.toLowerCase(),
            role: 'patient',
          };
        }
      },
    }),

    // Phone OTP provider
    CredentialsProvider({
      id: 'phone-otp',
      name: 'Phone OTP',
      credentials: {
        phone: { label: 'Phone', type: 'text' },
        otp: { label: 'OTP', type: 'text' },
      },
      async authorize(credentials) {
        // For demo: accept any valid 10-digit phone + 6-digit OTP
        if (credentials?.phone?.length === 10 && credentials?.otp?.length === 6) {
          try {
            // Check or create user by phone
            let user = await prisma.user.findUnique({
              where: { phone: credentials.phone },
              include: { subscription: true }
            });

            if (!user) {
              user = await prisma.user.create({
                data: {
                  phone: credentials.phone,
                  name: `User ${credentials.phone.slice(-4)}`,
                  email: `${credentials.phone}@zyntracare.com`,
                  role: 'patient',
                },
                include: { subscription: true }
              });

              // Send email notification to Admin
              import('@/lib/email').then(({ sendEmail }) => {
                sendEmail({
                  to: process.env.EMAIL_USER || 'admin@zyntracare.com', // Admin's email
                  subject: '🎉 New User Registration (Phone) - ZyntraCare',
                  html: `
                    <div style="font-family: sans-serif; padding: 20px;">
                      <h2 style="color: #0ea5e9;">New Phone User Signed Up!</h2>
                      <p><strong>Phone:</strong> ${user?.phone || credentials.phone}</p>
                      <p>Login to admin dashboard to view more details.</p>
                    </div>
                  `
                }).catch(e => console.error('Admin email error:', e));
              });
            }

            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
            };
          } catch (error) {
            console.error('[Auth] Phone OTP error:', error);
            return {
              id: `phone_${credentials.phone}`,
              name: `User ${credentials.phone.slice(-4)}`,
              email: `${credentials.phone}@sms.zyntracare.com`,
              role: 'patient',
            };
          }
        }
        return null;
      },
    }),
  ],

  pages: {
    signIn: '/',
    error: '/?error=1',
  },

  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },

  secret: process.env.NEXTAUTH_SECRET || 'development-secret-key-change-in-production',

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || 'patient';
        
        // Fetch subscription from DB
        try {
          const subscription = await prisma.subscription.findUnique({
            where: { userId: user.id }
          });
          token.subscription = subscription ? {
            plan: subscription.plan,
            status: subscription.status
          } : { plan: 'Free', status: 'active' };
        } catch {
          token.subscription = { plan: 'Free', status: 'active' };
        }
      }
      
      // Handle session update
      if (trigger === 'update' && session) {
        token.subscription = session.subscription;
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.subscription = token.subscription as { plan: string; status: string };
      }
      return session;
    },
  },
};