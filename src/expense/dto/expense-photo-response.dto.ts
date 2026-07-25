import { ApiProperty } from '@nestjs/swagger';

export class ExpensePhotoResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ description: 'Imagem em base64' })
  data: string;

  @ApiProperty({ example: 'image/jpeg' })
  mimeType: string;
}
