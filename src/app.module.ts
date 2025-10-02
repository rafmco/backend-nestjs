import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getTypeOrmConfig } from './orm-config';
import { AppConfigModule } from './app-config/app-config.module';
import { AppConfigService } from './app-config/app-config.service';
import { AuthModule } from './auth/auth.module';
import { FeatureModule } from './feature/feature.module';

// Annotation that defines a module in NestJS
@Module({
  imports: [
    AppConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [AppConfigModule],
      useFactory: getTypeOrmConfig,
      inject: [AppConfigService],
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
    AuthModule,
    FeatureModule,
  ],
})
export class AppModule {}
