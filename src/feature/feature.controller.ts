import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CurrentUserDto } from 'src/auth/current-user.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Roles } from 'src/auth/roles.decorator';

@Controller('feature')
export class FeatureController {
  @Get('public')
  getPublicFeature() {
    return { message: 'This is a public feature.' };
  }

  @Get('private')
  @UseGuards(JwtAuthGuard)
  getPrivateFeature(@CurrentUser() user: CurrentUserDto) {
    return { message: `This is a private feature for user ${user.username}.` };
  }

  @Get('admin')
  @Roles('Admin')
  @UseGuards(JwtAuthGuard)
  getAdminFeature(@CurrentUser() user: CurrentUserDto) {
    return { message: `This is an admin feature for user ${user.username}.` };
  }
}
