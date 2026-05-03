import { Injectable } from '@nestjs/common';
import { User } from '../models/users.model';

@Injectable()
export class UsersService {
  private users: User[] = [
    {
      id: 1,
      name: 'Administrador',
      email: 'admin@innovatech.cl',
      role: 'ADMIN',
    },
  ];

  findAll(): User[] {
    return this.users;
  }

  findById(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }
}