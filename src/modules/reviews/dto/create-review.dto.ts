import { IsString, IsNotEmpty, IsMongoId, IsNumber, Min, Max, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  user_id: string;

  @ApiProperty({ example: 5, minimum: 1, maximum: 5 })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ example: 'Great product! Highly recommended.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  comment: string;
} 