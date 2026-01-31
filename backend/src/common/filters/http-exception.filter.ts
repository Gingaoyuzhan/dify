import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto';

/**
 * 全局 HTTP 异常过滤器
 * 统一处理所有异常，返回标准格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status: number;
    let message: string;
    let code: number;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const res = exceptionResponse as Record<string, any>;
        message = res.message || exception.message;
      } else {
        message = exception.message;
      }

      // HTTP 状态码映射到业务错误码
      code = status;
    } else {
      // 未知异常
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = '服务器内部错误';
      code = HttpStatus.INTERNAL_SERVER_ERROR;

      // 记录未知异常详情
      this.logger.error(
        `未知异常: ${exception instanceof Error ? exception.message : exception}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    // 记录请求日志
    this.logger.warn(
      `[${request.method}] ${request.url} - ${status} - ${message}`,
    );

    const errorResponse = ApiResponse.error(message, code);

    response.status(status).json(errorResponse);
  }
}
