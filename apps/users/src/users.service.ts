import { Injectable } from '@nestjs/common';

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  role?: string;
}

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  create(user: Omit<User, 'id'>): User {
    const newUser: User = {
      id: this.idCounter++,
      ...user,
    };

    this.users.push(newUser);
    return newUser;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User | undefined {
    return this.users.find(u => u.id === id);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(u => u.email === email);
  }

  remove(id: number): void {
    this.users = this.users.filter(u => u.id !== id);
  }
}