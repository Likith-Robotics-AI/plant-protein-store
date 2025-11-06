// Supabase type helpers to avoid 'never' type issues

export type SupabaseQueryData<T> = T extends PromiseLike<{ data: infer U }> ? U : never;
export type SupabaseQueryError<T> = T extends PromiseLike<{ error: infer U }> ? U : never;
