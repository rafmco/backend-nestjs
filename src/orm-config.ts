import { DataSourceOptions } from 'typeorm';
import { AppConfigService } from 'src/app-config/app-config.service';

export const getTypeOrmConfig = (
  configService: AppConfigService,
): DataSourceOptions => ({
  type: 'mysql',
  host: configService.databaseHost,
  port: parseInt(configService.databasePort, 10),
  username: configService.databaseUser,
  password: configService.databasePassword,
  database: configService.databaseName,
  synchronize: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
});
