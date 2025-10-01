import { DataSourceOptions } from 'typeorm';

export const config: DataSourceOptions = {
  type: 'mysql',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: 'sql@dev',
  database: 'authon',
  synchronize: true,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
};
