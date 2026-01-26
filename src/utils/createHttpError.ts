import { HttpException, HttpStatus } from '@nestjs/common';
/**
 * 通用 HTTP 异常创建工具函数
 * 作用：统一封装 NestJS HttpException，标准化异常返回格式，同时输出错误日志
 * 特性：
 * 1. 提供默认错误信息和状态码，减少重复代码
 * 2. 自动处理 Error 实例，提取错误栈（便于调试）
 * 3. 标准化日志输出，包含时间戳
 * @param message - 错误提示信息（前端展示用），默认：'服务器内部错误'
 * @param status - HTTP 状态码，默认：500（INTERNAL_SERVER_ERROR）
 * @param error - 原始错误信息（调试用），支持任意类型，Error 实例会自动解析栈信息
 * @returns 标准化的 HttpException 实例，可直接抛出
 */
export function createHttpError(
  message = '服务器内部错误',
  status: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR,
  error: unknown = {},
): HttpException {
  // 格式化错误信息：如果是 Error 实例，提取 message 和 stack 便于调试
  const formattedError =
    error instanceof Error
      ? {
          message: error.message,
          stack:
            // TODO 环境变量从配置取
            // 生产环境隐藏错误栈
            process.env.NODE_ENV === 'development' ? error.stack : undefined,
        }
      : error;

  // 输出标准化错误日志（含时间戳、状态码、提示信息、原始错误）
  console.error(
    `[${new Date().toISOString()}] HTTP Error [${status}]:`,
    message,
    '\nRaw Error:',
    formattedError,
  );

  // 返回标准化的 HttpException
  return new HttpException(
    {
      statusCode: status,
      message,
      error: formattedError,
    },
    status,
  );
}
