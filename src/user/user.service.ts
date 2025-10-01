import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserActive } from './user-active.enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = this.userRepository.create(createUserDto);

    // add to user.id an uuid
    user.id = crypto.randomUUID();
    user.active = UserActive.ACTIVE;
    user.createdAt = new Date();

    return await this.userRepository.save(user);
  }

  async findAll() {
    if (!(await this.userRepository.find()))
      throw new NotFoundException('Nenhum usuário encontrado.');

    return await this.userRepository.find();
  }

  async findOne(id: string) {
    if (!(await this.userRepository.findOneBy({ id })))
      throw new NotFoundException(`Usuário id:${id} não encontrado.`);

    return await this.userRepository.findOneBy({ id });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    return await this.userRepository.update(id, updateUserDto);
  }

  async remove(id: string) {
    return await this.userRepository.delete(id);
  }
}
