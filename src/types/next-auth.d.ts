import 'next-auth';

/**
 * Augments the NextAuth session/user/JWT types so TypeScript
 * recognises the custom fields we add in the callbacks.
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id:            string;
      name?:         string | null;
      email?:        string | null;
      image?:        string | null;
      role?:         string;
      subscription?: {
        plan:   string;
        status: string;
      };
    };
  }

  interface User {
    role?:         string;
    subscription?: {
      plan:   string;
      status: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?:           string;
    role?:         string;
    subscription?: {
      plan:   string;
      status: string;
    };
  }
}