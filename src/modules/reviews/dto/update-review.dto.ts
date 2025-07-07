import { IsString, IsOptional, IsNumber, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiProperty({ example: 4, minimum: 1, maximum: 5, required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 'Updated review comment', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  comment?: string;
} 