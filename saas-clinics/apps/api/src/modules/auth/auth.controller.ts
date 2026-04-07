import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SelectClinicDto } from './dto/select-clinic.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private auth: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.auth.register(dto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('select-clinic')
  selectClinic(@Body() dto: SelectClinicDto) {
    return this.auth.selectClinic(dto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('refresh')
  refresh(@CurrentUser() user: any) {
    return this.auth.refreshAfterSetup(user.sub);
  }
}
