import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

// ~3 MB de base64 (a Vercel corta o corpo em ~4,5 MB; base64 infla ~33%).
const MAX_BASE64 = 3_000_000;

export class SetExpenseAudioDto {
  @ApiProperty({ description: 'Áudio em base64 (sem prefixo data URL)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_BASE64, { message: 'Áudio muito grande (máx. ~3 MB).' })
  data: string;

  @ApiProperty({ example: 'audio/webm' })
  @IsString()
  @Matches(/^audio\/[\w.+-]+$/, { message: 'mimeType deve ser audio/*.' })
  @MaxLength(64)
  mimeType: string;
}
