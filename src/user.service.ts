import { Injectable, NotFoundException } from '@nestjs/common';

export type User = {
  id?: number;
  name: string;
  age: number;
};

@Injectable()
export class UserService {
  // Teste de usuários em memória
  users: User[] = [];
  nextId: number = 1;

  getUsers(): User[] {
    return this.users;
  }

  addUser(newUser: User): User {
    newUser.id = this.nextId++;
    this.users.push(newUser);

    return newUser;
  }

  updateUser(id: number, userData: User): User {
    const index = this.users.findIndex((u) => u.id == id);
    if (index < 0) throw new NotFoundException();

    const user = this.users[index];

    user.name = userData.name ?? user.name;
    user.age = userData.age ?? user.age;

    this.users[index] = user;

    return user;
  }
}
