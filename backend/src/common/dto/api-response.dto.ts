/**
 * 统一 API 响应 DTO
 * 所有接口返回都应使用此格式
 */

/**
 * 基础响应结构
 */
export class ApiResponse<T = any> {
  /** 状态码，0 表示成功 */
  code: number;

  /** 响应消息 */
  message: string;

  /** 响应数据 */
  data: T;

  /** 时间戳 */
  timestamp: number;

  constructor(code: number, message: string, data: T) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
  }

  /**
   * 成功响应
   */
  static success<T>(data: T, message = 'success'): ApiResponse<T> {
    return new ApiResponse(0, message, data);
  }

  /**
   * 失败响应
   */
  static error(message: string, code = -1): ApiResponse<null> {
    return new ApiResponse(code, message, null);
  }
}

/**
 * 分页响应数据结构
 */
export class PaginatedData<T> {
  /** 数据列表 */
  list: T[];

  /** 总数 */
  total: number;

  /** 当前页码 */
  page: number;

  /** 每页数量 */
  pageSize: number;

  /** 总页数 */
  totalPages: number;

  constructor(list: T[], total: number, page: number, pageSize: number) {
    this.list = list;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
  }
}

/**
 * 分页响应
 */
export class PaginatedResponse<T> extends ApiResponse<PaginatedData<T>> {
  static paginated<T>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
  ): PaginatedResponse<T> {
    const data = new PaginatedData(list, total, page, pageSize);
    return new ApiResponse(0, 'success', data) as PaginatedResponse<T>;
  }
}
