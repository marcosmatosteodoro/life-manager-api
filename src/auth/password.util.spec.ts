import { hashPassword, verifyPassword } from './password.util';

describe('password.util', () => {
  it('gera hash diferente da senha em texto puro e no formato salt:hash', async () => {
    const hash = await hashPassword('segredo123');
    expect(hash).not.toContain('segredo123');
    expect(hash).toMatch(/^[0-9a-f]+:[0-9a-f]+$/);
  });

  it('usa salt aleatório: mesma senha gera hashes distintos', async () => {
    const a = await hashPassword('segredo123');
    const b = await hashPassword('segredo123');
    expect(a).not.toEqual(b);
  });

  it('verifica a senha correta como verdadeira', async () => {
    const hash = await hashPassword('segredo123');
    await expect(verifyPassword('segredo123', hash)).resolves.toBe(true);
  });

  it('rejeita senha incorreta', async () => {
    const hash = await hashPassword('segredo123');
    await expect(verifyPassword('errada', hash)).resolves.toBe(false);
  });

  it('retorna false para hash em formato inválido', async () => {
    await expect(verifyPassword('x', 'sem-dois-pontos')).resolves.toBe(false);
  });
});
