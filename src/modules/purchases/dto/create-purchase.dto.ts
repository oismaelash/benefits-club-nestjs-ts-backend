import { IsString, IsNotEmpty, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  user_id: string;

  @ApiProperty({ example: '507f1f77bcf86cd799439012' })
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  product_id: string;
} 