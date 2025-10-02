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
import { JwtService } from '@nestjs/jwt';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly jwtService: JwtService,
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
    const existingUser = await this.userRepository.findOne({
      where: { email },
      // carrega os relacionamentos
      relations: ['userGroupUsers', 'userGroupUsers.userGroup'],
    });

    if (!existingUser) {
      throw new UnauthorizedException('Email não encontrado.');
    }

    const salt = existingUser.salt;
    const storedHash = existingUser.password;

    const hash = (await scrypt(password, salt, 32)) as Buffer;
    if (storedHash !== hash.toString('hex')) {
      throw new UnauthorizedException('Senha inválida.');
    }

    // Extrai as roles do usuário
    const roles = existingUser.userGroupUsers
      ? existingUser.userGroupUsers.map((ugu) => ugu.userGroup.name)
      : [];

    const payload = {
      sub: existingUser.id,
      username: existingUser.email,
      roles: roles,
    };

    return { access_token: this.jwtService.sign(payload) };
  }
}
