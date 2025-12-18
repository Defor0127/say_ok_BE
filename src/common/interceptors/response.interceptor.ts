import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

@Injectable()
export class CommonResponseInterceptor implements NestInterceptor {
  //context: 요청 정보(req,res)에 접근. next: 실행 결과에 접근. next.handle로 컨트롤러 반환값을 받아냄
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      //data에 반환값이 들어있음. return으로 {data:~~,message:~~}를 보냈으면 data = {data,message}
      map((data) => {
        const message = data?.message ?? 'OK';
        // message 제거한 payload 생성
        let payload = data?.data ?? data;
        //만약 payload가
        if (
          payload &&
          typeof payload === 'object' &&
          'message' in payload
        ) {
          //구조 분해. 메시지는
          const { message: _, ...rest } = payload;
          payload = Object.keys(rest).length ? rest : null;
        }
        return {
          // 성공 응답 표준화하는 의도이므로 success: true 고정
          success: true,
          message: message ?? 'OK',
          data: payload,
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }
}
