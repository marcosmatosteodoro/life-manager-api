import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

// Teto do base64: ~3 MB. Base64 infla ~33% e a Vercel limita o corpo em ~4,5 MB,
// então mantemos folga (≈ vários minutos de nota de voz em opus).
const MAX_BASE64 = 3_000_000;

export class SetBacklogAudioDto {
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
