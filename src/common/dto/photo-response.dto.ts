import { ApiProperty } from '@nestjs/swagger';

/** Foto de perfil devolvida ao cliente (base64 + mimeType). */
export class PhotoResponseDto {
  @ApiProperty({ description: 'Imagem em base64 (sem prefixo data URL)' })
  data: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;
}
