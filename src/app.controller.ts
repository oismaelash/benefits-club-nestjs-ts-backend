import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Public } from './common/decorators/public.decorator';

@ApiTags('health')
@Controller()
export class AppController {
  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  getHealth(): { message: string; timestamp: string } {
    return {
      message: 'Benefits Club API is running!',
      timestamp: new Date().toISOString(),
    };
  }
} 