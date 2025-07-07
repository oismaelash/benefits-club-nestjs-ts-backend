import { IsString, IsNotEmpty, IsNumber, IsPositive, MaxLength, IsOptional, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ 
    example: 'Wireless Headphones',
    description: 'Product name'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ 
    example: 'High-quality wireless headphones with noise cancellation',
    description: 'Detailed product description'
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description: string;

  @ApiProperty({ 
    example: 99.99,
    description: 'Product price in currency units'
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price: number;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    required: false,
    description: 'Category ID - Use GET /products/categories to get available categories'
  })
  @IsOptional()
  @IsString()
  @IsMongoId()
  category?: string;
} 