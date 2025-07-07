import { IsString, IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateWishlistDto {
  @ApiProperty({ example: 'high', enum: ['low', 'medium', 'high'], required: false })
  @IsOptional()
  @IsString()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  isNotified?: boolean;
} 