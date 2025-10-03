import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigService } from 'src/app-config/app-config.service';
import { AppConfigModule } from 'src/app-config/app-config.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { RefreshToken } from './entities/refreshToken.entity';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User]),
    TypeOrmModule.forFeature([RefreshToken]),
    JwtModule.registerAsync({
      inject: [AppConfigService],
      imports: [AppConfigModule],
      useFactory: (config: AppConfigService) => ({
        secret: config.jwtSecret,
        signOptions: { expiresIn: '60s' },
      }),
    }),
    AppConfigModule,
  ],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
