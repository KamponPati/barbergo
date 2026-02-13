import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";

type RequestWithContext = Request & { requestId?: string };

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithContext>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = "SYSTEM_INTERNAL_ERROR";
    let message = "Unexpected server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
        const objectResponse = exceptionResponse as Record<string, unknown>;
        code = (objectResponse.code as string) ?? code;
        message = (objectResponse.message as string) ?? message;
      } else if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      }
    }

    response.status(status).json({
      code,
      message,
      request_id: request.requestId ?? null
    });
  }
}
