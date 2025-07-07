import { IsEmail, IsString, MinLength, MaxLength, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({ example: 'john@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'newPassword123', required: false })
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  name?: string;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
} 