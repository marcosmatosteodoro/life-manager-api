import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CurrentUser } from './current-user.decorator';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // Rota pública: rate limit por IP contra força bruta de credenciais (A07).
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Autentica e retorna um token JWT' })
  @ApiOkResponse({ description: 'Token (JWT) + flag de troca de senha' })
  @ApiUnauthorizedResponse({ description: 'Credenciais inválidas' })
  @ApiTooManyRequestsResponse({ description: 'Muitas tentativas — tente depois' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Troca a senha do usuário autenticado' })
  @ApiNoContentResponse({ description: 'Senha alterada' })
  @ApiUnauthorizedResponse({ description: 'Senha atual incorreta' })
  changePassword(
    @CurrentUser() userId: number,
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(userId, dto);
  }
}
