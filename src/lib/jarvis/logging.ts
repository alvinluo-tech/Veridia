import { createServiceClient } from '@/lib/supabase/server'

export async function logToolCall(
  userId: string,
  toolName: string,
  input: Record<string, unknown>,
  output: Record<string, unknown> | null,
  status: 'success' | 'error' = 'success',
  errorMessage?: string
): Promise<void> {
  const supabase = createServiceClient()

  await supabase.from('jarvis_tool_logs').insert({
    user_id: userId,
    tool_name: toolName,
    input,
    output,
    status,
    error_message: errorMessage,
  })
}
