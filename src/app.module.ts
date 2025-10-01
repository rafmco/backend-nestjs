import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from './orm-config';

// Annotation that defines a module in NestJS
@Module({
  imports: [TypeOrmModule.forRoot(config), UserModule],
})
export class AppModule {}
