import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { Request } from "express";

export const GetUser = createParamDecorator((_, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<Request>();

  return request.user;
});
