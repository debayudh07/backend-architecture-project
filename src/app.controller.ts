import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @ApiOperation({ summary: 'Health check' })
  @ApiResponse({ status: 200, description: 'Returns Hello World.' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
