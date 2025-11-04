import bcrypt from 'bcryptjs'

const SALT_ROUNDS = 10

export const hashPassword = async (password: string): Promise<string> => {
  return await bcrypt.hash(password, SALT_ROUNDS)
}

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword)
}

export const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: '비밀번호는 최소 8자 이상이어야 합니다.' }
  }

  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '비밀번호에 최소 1개의 대문자가 포함되어야 합니다.' }
  }

  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '비밀번호에 최소 1개의 소문자가 포함되어야 합니다.' }
  }

  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '비밀번호에 최소 1개의 숫자가 포함되어야 합니다.' }
  }

  return { valid: true }
}
