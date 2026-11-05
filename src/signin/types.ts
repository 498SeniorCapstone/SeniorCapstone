export interface SignInValues {
  email: string
  password: string
}

export interface SignUpValues extends SignInValues {
  username: string
  confirmPassword: string
}

export type AuthFlowResult = 'ready' | 'profile-setup' | 'confirmation-required'

export type AccountUpgradeResult = 'complete' | 'confirmation-required'
