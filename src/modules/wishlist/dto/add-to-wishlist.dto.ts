import { IsString, IsNotEmpty, IsMongoId, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  product_id: string;

  @ApiProperty({ example: 'high', enum: ['low', 'medium', 'high'], required: false })
  @IsOptional()
  @IsString()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;
} 