import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { ClassConstructor, plainToInstance } from "class-transformer";
import { map, Observable } from "rxjs";

export function Serialize<T>(dto: ClassConstructor<T>) {
  return UseInterceptors(new SerializeInterceptor(dto));
}

export class SerializeInterceptor<T> implements NestInterceptor {
  constructor(private dto: ClassConstructor<T>) { }

  intercept(_: ExecutionContext, next: CallHandler<any>): Observable<any> {
    return next.handle().pipe(
      map((data: T) => {
        return plainToInstance(this.dto, data, {
          // excludeExtraneousValues: true,
        })
      })
    );
  }
}