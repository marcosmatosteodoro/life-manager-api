import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import {
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiTooManyRequestsResponse,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { FeedbackListResponseDto } from './dto/feedback-list-response.dto';
import { Feedback } from './entities/feedback.entity';
import { FeedbackService } from './feedback.service';

@ApiTags('feedback')
@Controller('feedback')
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  // Endpoint pago (IA): rate limit estrito por usuário (mesmo racional do resumo).
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Gera (via IA) e salva um feedback do período informado',
  })
  @ApiOkResponse({ type: Feedback })
  @ApiServiceUnavailableResponse({ description: 'Falha no serviço de IA' })
  @ApiTooManyRequestsResponse({ description: 'Limite de requisições excedido' })
  generate(@Body() dto: CreateFeedbackDto) {
    return this.service.generate(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista os feedbacks salvos' })
  @ApiOkResponse({ type: FeedbackListResponseDto })
  findAll() {
    return this.service.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca um feedback por id' })
  @ApiOkResponse({ type: Feedback })
  @ApiNotFoundResponse({ description: 'Registro não encontrado' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }
}
