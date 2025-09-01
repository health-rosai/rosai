// デモモード用のモッククライアント
export class DemoSupabaseClient {
  auth = {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      // デモ用の認証ロジック
      const demoAccounts = [
        { email: 'admin@test.com', password: 'admin123456', role: 'admin' },
        { email: 'manager@test.com', password: 'manager123456', role: 'manager' },
        { email: 'operator@test.com', password: 'operator123456', role: 'operator' },
        { email: 'viewer@test.com', password: 'viewer123456', role: 'viewer' }
      ];

      const account = demoAccounts.find(a => a.email === email && a.password === password);
      
      if (account) {
        return {
          data: {
            user: {
              id: 'demo-user-' + account.role,
              email: account.email,
              role: account.role,
              user_metadata: { role: account.role }
            },
            session: {
              access_token: 'demo-token',
              refresh_token: 'demo-refresh-token'
            }
          },
          error: null
        };
      }

      return {
        data: null,
        error: { message: 'Invalid credentials' }
      };
    },

    signInWithOAuth: async ({ provider }: { provider: string }) => {
      // デモモードではOAuthは利用不可
      return {
        data: null,
        error: { message: 'OAuth is not available in demo mode' }
      };
    },

    getUser: async () => {
      // セッションストレージから取得
      const demoUser = typeof window !== 'undefined' 
        ? window.sessionStorage.getItem('demo-user')
        : null;
      
      if (demoUser) {
        return {
          data: { user: JSON.parse(demoUser) },
          error: null
        };
      }

      return {
        data: { user: null },
        error: null
      };
    },

    signOut: async () => {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem('demo-user');
      }
      return { error: null };
    }
  };

  from(table: string) {
    return {
      select: () => ({
        eq: () => ({
          single: async () => ({ data: {}, error: null })
        }),
        order: () => ({
          limit: async () => ({ data: [], error: null })
        })
      }),
      insert: () => ({
        select: () => ({
          single: async () => ({ data: {}, error: null })
        })
      }),
      update: () => ({
        eq: () => ({
          select: () => ({
            single: async () => ({ data: {}, error: null })
          })
        })
      }),
      delete: () => ({
        eq: async () => ({ error: null })
      })
    };
  }
}

export function createDemoClient() {
  return new DemoSupabaseClient();
}