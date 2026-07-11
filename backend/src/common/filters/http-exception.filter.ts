import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error occurred';

    const errorDetails = typeof message === 'object' ? message : { message };

    const payload = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      error: (errorDetails as any).error || 'Error',
      message: (errorDetails as any).message || message,
    };

    // Log the exception securely (hide credential params or request payloads)
    this.logger.error(`[${request.method}] ${request.url} - Status ${status} - Error: ${JSON.stringify(payload.message)}`);
    if (!(exception instanceof HttpException)) {
      this.logger.error(exception);
    }

    response.status(status).json(payload);
  }
}
