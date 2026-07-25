import { ApiProperty } from '@nestjs/swagger';

export class BacklogAudioResponseDto {
  @ApiProperty({ description: 'Áudio em base64' })
  data: string;

  @ApiProperty({ example: 'audio/webm' })
  mimeType: string;
}
