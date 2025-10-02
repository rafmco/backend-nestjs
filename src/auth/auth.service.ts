import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserActive } from '../user/user-active.enum';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async signUp(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.findOneBy({ email });
    if (existingUser) {
      throw new NotFoundException('Email já cadastrado.');
    }

    const salt = randomBytes(8).toString('hex');
    const hash = (await scrypt(password, salt, 32)) as Buffer;
    // const saltAndHash = `${salt}.${hash.toString('hex')}`;

    const user = this.userRepository.create({
      name,
      email,
      password: hash.toString('hex'),
      salt,
    });

    user.id = crypto.randomUUID();
    user.active = UserActive.ACTIVE;
    user.createdAt = new Date();

    const savedUser = await this.userRepository.save(user);

    // Omit password and salt in the response
    const { password: _, salt: __, ...result } = savedUser;
    return result;
  }

  async signIn(email: string, password: string) {
    const existingUser = await this.userRepository.findOneBy({ email });
    if (!existingUser) {
      throw new UnauthorizedException('Email não encontrado.');
    }

    const salt = existingUser.salt;
    const storedHash = existingUser.password;

    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new UnauthorizedException('Senha inválida.');
    }

    // Omit password and salt in the response
    const { password: _, salt: __, ...result } = existingUser;
    return result;
  }
}
