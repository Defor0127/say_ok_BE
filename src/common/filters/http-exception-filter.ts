import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

//메시지 정규화 함수.
function normalizeMessage(msg: unknown): string {
  // validation 에러같은 경우 에러가 2개씩 발생해서 배열로 오는 경우도 있음.
  // 배열로 오는 경우 (',')으로 join하여 하나의 string으로 합친 후 retrun
  if (Array.isArray(msg)) return msg.join(', ');
  // string이면 msg그대로 리턴.
  if (typeof msg === 'string') return msg;
  return '요청 처리 중 오류가 발생했습니다.';
}

//데코레이터. 이 필터가 어떤 예외를 처리하는지. 비어있으면 전체 예외를 잡음 http만 잡지않는 이유는 throw하지 않은거 응답값도 고정하기 위해.
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  //exception: 예외 객체. host: 현재 요청 컨텍스트(nest는 실행 환경에 따라 예외흐름이 달라서 분기처리 필요함.)
  // http에서는 res.status로 내리고, websocket에서는 client.emit 사용하는데 이런 것 때문에 바꿔줘야함.
  catch(exception: unknown, host: ArgumentsHost) {
    //host를 http 예외처리용으로 전환(http 방식으로 해석)
    const ctx = host.switchToHttp();
    // response 객체 꺼냄
    const res = ctx.getResponse<Response>();
    // request 객체 꺼냄
    const req = ctx.getRequest<Request>();
    const timestamp = new Date().toISOString();
    // 요청 경로 기록
    const path = req.originalUrl ?? req.url;

    // HttpException인지 구분(throw 된 건지 확인)
    if (exception instanceof HttpException) {
      // 상태 코드 추출
      const statusCode = exception.getStatus();
      // 응답 body 추출 ex) { "statusCode": 404, "message": "xxx", "error": "Not Found" }
      const responseBody = exception.getResponse();
      // 일단 message 에 exception.message 넣음
      let message = exception.message;
      //
      let details: any = undefined;

      if (typeof responseBody === 'string') {
        message = responseBody;
      } else if (typeof responseBody === 'object' && responseBody !== null) {
        const rb: any = responseBody;

        // ✅ 최상단 message는 여기서만 확정
        message = normalizeMessage(rb.message ?? message);

        // ✅ details에서 중복되는 표준 키 제거
        const {

          error: _e,
          statusCode: _s,
          ...rest
        } = rb;

        // rest가 비어있지 않을 때만 details로 내려줌
        details = Object.keys(rest).length ? rest : undefined;
      }

      return res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        timestamp,
        path,
        ...(details ? { details } : {}),
      });
    }
    //throw한게 아닌 진짜 서버 에러. 버그나 db에러같은거
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: '서버 에러가 발생했습니다.',
      timestamp,
      path,
    });
  }
}
