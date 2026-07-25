import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';

/** Gestão de usuários — **somente admin** (Configurações → Usuários). */
@ApiTags('users')
@ApiForbiddenResponse({ description: 'Requer papel admin' })
@Controller('users')
@UseGuards(RolesGuard)
@Roles('admin')
export class UserAdminController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Lista todos os usuários (admin)' })
  @ApiOkResponse({ type: UserResponseDto, isArray: true })
  list() {
    return this.service.listAll();
  }

  @Post()
  @ApiOperation({ summary: 'Cria um usuário (admin)' })
  @ApiOkResponse({ type: UserResponseDto })
  create(@Body() dto: CreateUserDto) {
    return this.service.adminCreate(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edita um usuário (admin)' })
  @ApiOkResponse({ type: UserResponseDto })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdminUpdateUserDto,
  ) {
    return this.service.adminUpdate(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove um usuário (admin)' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() currentUserId: number,
  ) {
    return this.service.adminRemove(id, currentUserId);
  }
}
