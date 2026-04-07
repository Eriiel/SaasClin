import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { CurrentClinic } from '../../common/decorators/current-clinic.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private users: UsersService) {}

  @Post()
  @Roles('ADMIN', 'SUPER_ADMIN')
  create(@CurrentClinic() clinicId: string, @Body() dto: CreateUserDto) {
    return this.users.create(clinicId, dto);
  }

  @Get()
  findAll(@CurrentClinic() clinicId: string) {
    return this.users.findAll(clinicId);
  }

  @Delete(':userId')
  @Roles('ADMIN', 'SUPER_ADMIN')
  remove(@CurrentClinic() clinicId: string, @Param('userId') userId: string) {
    return this.users.remove(clinicId, userId);
  }
}
