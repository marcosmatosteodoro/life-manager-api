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

  // Aceita o tipo + parâmetros do celular (ex.: audio/webm;codecs=opus, audio/mp4).
  @ApiProperty({ example: 'audio/webm;codecs=opus' })
  @IsString()
  @Matches(/^audio\/[\w.+-]+(?:;[\w.+=/ -]+)*$/i, {
    message: 'mimeType deve ser audio/*.',
  })
  @MaxLength(64)
  mimeType: string;
}
