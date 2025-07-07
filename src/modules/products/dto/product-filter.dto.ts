import { IsOptional, IsNumber, IsPositive, IsString, MaxLength, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ProductFilterDto {
  @ApiProperty({ example: 50, required: false, description: 'Minimum price filter' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price_min?: number;

  @ApiProperty({ example: 200, required: false, description: 'Maximum price filter' })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price_max?: number;

  @ApiProperty({ example: 'headphones', required: false, description: 'Search keyword' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false, description: 'Filter by category ID' })
  @IsOptional()
  @IsString()
  @IsMongoId()
  category?: string;
} 