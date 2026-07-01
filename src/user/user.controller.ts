import { Body, Controller, Get, Patch } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/current-user.decorator';
import { UpdateMeDto } from './dto/update-me.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserService } from './user.service';

@ApiTags('me')
@Controller('me')
export class UserController {
  constructor(private readonly service: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Perfil do usuário autenticado' })
  @ApiOkResponse({ type: UserResponseDto })
  getMe(@CurrentUser() userId: number) {
    return this.service.getMe(userId);
  }

  @Patch()
  @ApiOperation({ summary: 'Atualiza o próprio perfil' })
  @ApiOkResponse({ type: UserResponseDto })
  updateMe(@CurrentUser() userId: number, @Body() dto: UpdateMeDto) {
    return this.service.updateMe(userId, dto);
  }
}
