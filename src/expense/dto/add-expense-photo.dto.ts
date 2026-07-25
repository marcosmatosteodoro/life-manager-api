import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches, MaxLength } from 'class-validator';

// ~3 MB de base64 (a Vercel corta o corpo em ~4,5 MB; o front comprime a imagem).
const MAX_BASE64 = 3_000_000;

export class AddExpensePhotoDto {
  @ApiProperty({ description: 'Imagem em base64 (sem prefixo data URL)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(MAX_BASE64, { message: 'Imagem muito grande (máx. ~3 MB).' })
  data: string;

  @ApiProperty({ example: 'image/jpeg' })
  @IsString()
  @Matches(/^image\/[\w.+-]+$/, { message: 'mimeType deve ser image/*.' })
  @MaxLength(64)
  mimeType: string;
}
