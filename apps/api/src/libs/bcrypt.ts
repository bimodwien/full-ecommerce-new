import { genSalt, compare, hash } from 'bcrypt';

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await genSalt(10);
  return await hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashed: string,
): Promise<boolean> => {
  return await compare(password, hashed);
};
