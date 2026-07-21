import { UserThrottlerGuard } from './user-throttler.guard';

// getTracker é protected; o cast acessa para testar a escolha da chave.
type Tracker = { getTracker(req: Record<string, unknown>): Promise<string> };

describe('UserThrottlerGuard.getTracker', () => {
  const guard = new UserThrottlerGuard(
    { throttlers: [] } as never,
    {} as never,
    {} as never,
  );
  const tracker = guard as unknown as Tracker;

  it('usa o sub do usuário autenticado como chave', async () => {
    await expect(
      tracker.getTracker({ user: { sub: '7' }, ip: '1.2.3.4' }),
    ).resolves.toBe('user:7');
  });

  it('cai para o IP quando não há usuário', async () => {
    await expect(tracker.getTracker({ ip: '1.2.3.4' })).resolves.toBe(
      '1.2.3.4',
    );
  });
});
