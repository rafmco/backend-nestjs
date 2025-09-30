import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import type { User } from './user.service';
import { UserService } from './user.service';

// Annotation
// Sem parâmetro equivalente à "/"
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getUsers(): User[] {
    return this.userService.getUsers();
  }

  @Post()
  postUser(@Body() newUser: User): User {
    return this.userService.addUser(newUser);
  }

  @Patch(':id')
  patchUser(@Param('id') id: number, @Body() userData: User): User {
    return this.userService.updateUser(id, userData);
  }
}
