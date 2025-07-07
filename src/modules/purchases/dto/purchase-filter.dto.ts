import { IsOptional, IsString, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class PurchaseFilterDto {
  @ApiProperty({ example: '507f1f77bcf86cd799439011', required: false, description: 'Filter purchases by user ID' })
  @IsOptional()
  @IsString()
  @IsMongoId()
  user_id?: string;
} 