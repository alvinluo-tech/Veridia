export interface AuthUser {
  id: string
  email: string
  user_metadata?: { display_name?: string }
}

export interface AuthProvider {
  getUser(): Promise<AuthUser | null>
  signIn(email: string, password: string): Promise<AuthUser>
  signUp(email: string, password: string, displayName: string): Promise<AuthUser>
  signOut(): Promise<void>
}
