import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * 应用根控制器
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * 健康检查接口
   * GET /api/health
   */
  @Get('health')
  getHealth(): { status: string; timestamp: number } {
    return {
      status: 'ok',
      timestamp: Date.now(),
    };
  }

  /**
   * 根路径
   * GET /api
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
