import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserActive } from '../user/user-active.enum';
import { RefreshToken } from './entities/refreshToken.entity';

import { randomBytes, scrypt as _scrypt } from 'crypto';
import { promisify } from 'util';
import { JwtService } from '@nestjs/jwt';

import { v4 as uuid } from 'uuid';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,

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
      id: uuid(),
      name,
      email,
      password: hash.toString('hex'),
      salt,
    });

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

    const accessToken = this.jwtService.sign(
      { ...payload, type: 'access' },
      { expiresIn: '60s' },
    );

    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { expiresIn: '1h' },
    );

    console.log('1');
    // Salvar o refresh token no banco de dados
    const newRefreshToken = this.refreshTokenRepository.create({
      id: uuid(),
      value: refreshToken,
      userId: existingUser.id,
      createdAt: new Date(),
    });

    console.log('2');
    await this.refreshTokenRepository.save(newRefreshToken);

    return { accessToken, refreshToken };
  }

  async refresh(refreshToken: string) {
    const payload = this.jwtService.verify(refreshToken);
    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type.');
    }

    // Verifica se o refresh token existe no banco de dados
    const storedToken = await this.refreshTokenRepository.findOneBy({
      value: refreshToken,
      userId: payload.sub,
      deletedAt: IsNull(),
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const existingUser = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['userGroupUsers', 'userGroupUsers.userGroup'],
    });

    if (!existingUser) {
      throw new UnauthorizedException('Invalid refresh token.');
    }

    // Extrai as roles do usuário
    const roles = existingUser.userGroupUsers
      ? existingUser.userGroupUsers.map((ugu) => ugu.userGroup.name)
      : [];

    const newPayload = {
      sub: existingUser.id,
      username: existingUser.email,
      roles: roles,
    };

    const newAccessToken = this.jwtService.sign(
      { ...newPayload, type: 'access' },
      { expiresIn: '60s' },
    );

    const newRefreshToken = this.jwtService.sign(
      { ...newPayload, type: 'refresh' },
      { expiresIn: '1h' },
    );

    // Invalida o refresh token antigo (soft delete)
    storedToken.deletedAt = new Date();
    await this.refreshTokenRepository.save(storedToken);

    // Salvar o refresh token no banco de dados
    const createRefreshToken = this.refreshTokenRepository.create({
      id: uuid(),
      value: newRefreshToken,
      userId: existingUser.id,
      createdAt: new Date(),
    });

    await this.refreshTokenRepository.save(createRefreshToken);

    return { accesToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
