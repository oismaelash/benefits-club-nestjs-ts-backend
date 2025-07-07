import { IsOptional, IsNumber, Min, Max, IsMongoId, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ReviewFilterDto {
  @ApiProperty({ example: 5, minimum: 1, maximum: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(5)
  rating?: number;

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

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  limit?: number;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  @Min(0)
  offset?: number;
} 