import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { getTypeOrmConfig } from './orm-config';

// Annotation that defines a module in NestJS
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [ConfigService],
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mysql',
    //     host: configService.get('DATABASE_HOST'),
    //     port: parseInt(configService.get<string>('DATABASE_PORT', '3306'), 10),
    //     username: configService.get('DATABASE_USER'),
    //     password: configService.get('DATABASE_PASSWORD'),
    //     database: configService.get('DATABASE_NAME'),
    //     synchronize: true,
    //     entities: [__dirname + '/**/*.entity{.ts,.js}'],
    //   }),
    //   inject: [ConfigService],
    // }),
    UserModule,
  ],
})
export class AppModule {}
