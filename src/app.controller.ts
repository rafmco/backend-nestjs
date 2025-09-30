import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

// Annotation
// Sem parâmetro equivalente à "/"
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ola')
  getOla(): string {
    return 'Olá mundo!';
  }
}
