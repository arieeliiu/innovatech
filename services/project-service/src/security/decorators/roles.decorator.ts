import { SetMetadata } from '@nestjs/common';
import { AppRole } from '../utils/role.utils';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: AppRole[]) => SetMetadata(ROLES_KEY, roles);
