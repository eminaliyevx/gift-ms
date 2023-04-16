import { HttpService } from "@nestjs/axios";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Reflector } from "@nestjs/core";
import { Role } from "@prisma/client";
import { AxiosError } from "axios";
import { Request } from "express";
import { catchError, lastValueFrom, map } from "rxjs";
import { ROLES_KEY } from "../decorators/roles.decorator";
import { AccountWithoutPassword } from "../types";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {}

  async canActivate(context: ExecutionContext) {
    const roles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<Request>();

    try {
      const user = await lastValueFrom(
        this.httpService
          .get<AccountWithoutPassword>(
            `${this.configService.get<string>(
              "AUTH_HTTP_SERVICE_URL",
            )}/auth/account`,
            {
              headers: {
                authorization: request.headers.authorization,
              },
            },
          )
          .pipe(
            map((response) => response.data),
            catchError((error: AxiosError) => {
              throw error.response.data;
            }),
          ),
      );

      request["user"] = user;
      request["token"] = request.headers.authorization;

      if (!roles) {
        return true;
      }

      return roles.some((role) => user.role === role);
    } catch (error) {
      throw error;
    }
  }
}
