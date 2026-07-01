import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const KEY_LEN = 64;
const SALT_BYTES = 16;

/**
 * Gera o hash da senha com scrypt (aprovado pela diretriz de segurança).
 * Formato guardado: "<saltHex>:<derivedHex>" — salt aleatório por usuário.
 * A senha em texto puro nunca é persistida nem logada.
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = (await scryptAsync(plain, salt, KEY_LEN)) as Buffer;
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

/**
 * Confere a senha contra o hash guardado, em tempo constante (mitiga timing
 * attacks). Retorna false para formato inválido em vez de lançar.
 */
export async function verifyPassword(
  plain: string,
  stored: string,
): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;

  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const derived = (await scryptAsync(plain, salt, expected.length)) as Buffer;

  // Comprimentos iguais são garantidos pelo keylen, mas checamos por segurança.
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}
