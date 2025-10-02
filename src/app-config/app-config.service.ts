import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService) {}

  get appPort(): string {
    return this.config.get<string>('PORT', '');
  }

  get databaseHost(): string {
    return this.config.get<string>('DATABASE_HOST', '');
  }

  get databasePort(): string {
    return this.config.get<string>('DATABASE_PORT', '');
  }

  get databaseUser(): string {
    return this.config.get<string>('DATABASE_USER', '');
  }

  get databasePassword(): string {
    return this.config.get<string>('DATABASE_PASSWORD', '');
  }

  get databaseName(): string {
    return this.config.get<string>('DATABASE_NAME', '');
  }

  get jwtSecret(): string {
    return this.config.getOrThrow<string>('JWT_SECRET', '');
  }
}
