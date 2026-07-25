import { ApiProperty } from '@nestjs/swagger';

export class ExpenseAudioResponseDto {
  @ApiProperty({ description: 'Áudio em base64' })
  data: string;

  @ApiProperty({ example: 'audio/webm' })
  mimeType: string;
}
