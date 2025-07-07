import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { PurchaseFilterDto } from './dto/purchase-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('purchases')
@Controller('purchases')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @ApiOperation({ summary: 'Register a purchase' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Purchase created successfully' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Invalid purchase data or product not available' })
  async create(@Body() createPurchaseDto: CreatePurchaseDto) {
    return this.purchasesService.create(createPurchaseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Retrieve all purchases' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Purchases retrieved successfully' })
  @ApiQuery({ name: 'user_id', required: false, type: String, description: 'Filter purchases by user ID' })
  async findAll(@Query() filterDto: PurchaseFilterDto) {
    return this.purchasesService.findAll(filterDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific purchase by ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Purchase retrieved successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Purchase not found' })
  async findOne(@Param('id') id: string) {
    return this.purchasesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel a specific purchase' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Purchase cancelled successfully' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Purchase not found' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Purchase already cancelled' })
  async remove(@Param('id') id: string) {
    await this.purchasesService.remove(id);
    return { message: 'Purchase cancelled successfully' };
  }
} 