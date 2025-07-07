import { IsString, IsNumber, IsPositive, MaxLength, IsOptional, IsMongoId, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateProductDto {
  @ApiProperty({ 
    example: 'Wireless Headphones Pro', 
    required: false,
    description: 'Product name'
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @ApiProperty({ 
    example: 'Premium wireless headphones with advanced noise cancellation', 
    required: false,
    description: 'Detailed product description'
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;

  @ApiProperty({ 
    example: 129.99, 
    required: false,
    description: 'Product price in currency units'
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price?: number;

  @ApiProperty({ 
    example: '507f1f77bcf86cd799439011', 
    required: false,
    description: 'Category ID - Use GET /products/categories to get available categories'
  })
  @IsOptional()
  @IsString()
  @IsMongoId()
  category?: string;

  @ApiProperty({ 
    example: true, 
    required: false,
    description: 'Product availability status'
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 