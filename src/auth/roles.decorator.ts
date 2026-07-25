import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '../user/user.constants';

/** Chave de metadado com os papéis exigidos por uma rota/controller. */
export const ROLES_KEY = 'roles';

/**
 * Restringe a rota/controller aos papéis informados (ex.: `@Roles('admin')`).
 * Precisa do `RolesGuard` (via `@UseGuards(RolesGuard)`). Sem o decorator, o
 * `RolesGuard` libera (papel não é exigido).
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
