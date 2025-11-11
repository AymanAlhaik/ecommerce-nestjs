import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, NotBeforeError, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import * as process from 'node:process';
import { UserService } from '../user.service';
import { Reflector } from '@nestjs/core';
import { Roles } from '../decorators/roles.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.get(Roles, context.getHandler());
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!roles) {
      return true;
    }
    if (!token) {
      throw new UnauthorizedException('Taken is required');
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
      if (
        !payload.role ||
        payload.role === '' ||
        !roles.includes(payload.role)
      ) {
        throw new UnauthorizedException('Your role is not authorized for this action');
      }

      request['user'] = payload;
    } catch (e) {
      if (e instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token has expired');
      }
      if (e instanceof JsonWebTokenError) {
        throw new UnauthorizedException('Token is invalid');
      }
      if (e instanceof NotBeforeError) {
        throw new UnauthorizedException('Token is not active yet');
      }

    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
