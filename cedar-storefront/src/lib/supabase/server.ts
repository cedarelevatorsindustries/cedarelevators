// Placeholder Supabase client until Supabase is properly configured
export async function createClient() {
  return {
    from: (table: string) => ({
      select: (columns: string) => {
        const selectChain = {
          eq: (column: string, value: any) => ({
            single: async (): Promise<{ data: any; error: any }> => ({ 
              data: null, 
              error: { message: 'Supabase not configured' } 
            }),
          }),
        }
        return selectChain
      },
    }),
  }
}
