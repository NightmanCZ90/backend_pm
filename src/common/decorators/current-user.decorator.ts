import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export const CurrentUser = createParamDecorator((_: never, context: ExecutionContext) => {
  const request: Express.Request = context.switchToHttp().getRequest();
  return request.user;
}
)