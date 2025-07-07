import { IsOptional, IsString, IsEnum, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WishlistFilterDto {
  @ApiProperty({ example: 'high', enum: ['low', 'medium', 'high'], required: false })
  @IsOptional()
  @IsString()
  @IsEnum(['low', 'medium', 'high'])
  priority?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false })
  @IsOptional()
  @IsString()
  @IsMongoId()
  user_id?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012', required: false })
  @IsOptional()
  @IsString()
  @IsMongoId()
  product_id?: string;
} 