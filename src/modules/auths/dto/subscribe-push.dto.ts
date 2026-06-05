import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SubscribePushDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsString()
  @IsNotEmpty({ message: 'deviceId không được để trống' })
  deviceId: string;

  @ApiProperty({
    example: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
    required: false,
  })
  @IsString()
  @IsOptional()
  expoPushToken?: string;

  @ApiProperty({
    example: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/...',
      keys: { p256dh: '...', auth: '...' },
    },
    required: false,
  })
  @IsOptional()
  webPushSub?: any;
}
