import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiResponse } from '../dto/api-response.dto';

/**
 * 响应转换拦截器
 * 自动将 Controller 返回值包装为统一响应格式
 *
 * 注意：如果 Controller 已经返回 ApiResponse 实例，则不会重复包装
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果已经是 ApiResponse 格式，直接返回
        if (data instanceof ApiResponse) {
          return data;
        }
        // 检查是否已经是标准响应格式（duck typing）
        if (
          data &&
          typeof data === 'object' &&
          'code' in data &&
          'message' in data &&
          'timestamp' in data
        ) {
          return data;
        }
        // 包装为标准响应格式
        return ApiResponse.success(data);
      }),
    );
  }
}
