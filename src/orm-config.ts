import { DataSourceOptions } from 'typeorm';
import { ConfigService } from '@nestjs/config';

export const getTypeOrmConfig = (
  configService: ConfigService,
): DataSourceOptions => ({
  type: 'mysql',
  host: configService.get('DATABASE_HOST'),
  port: parseInt(configService.get<string>('DATABASE_PORT', '3306'), 10),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  synchronize: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
});
