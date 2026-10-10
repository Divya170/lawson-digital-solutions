import { CanActivate, createParamDecorator, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { config } from '../config';
import { AuthService, StaffSession } from './auth.service';

type StaffRequest = Request & { staff?: StaffSession };

/** Accepts the httpOnly session cookie (browser) or an `Authorization: Bearer` header (API clients). */
@Injectable()
export class StaffAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<StaffRequest>();
    const header = req.headers.authorization || '';
    const token = (req.cookies && req.cookies[config.cookieName]) || (header.startsWith('Bearer ') ? header.slice(7) : '');
    if (!token) throw new UnauthorizedException('Please sign in to continue.');
    req.staff = await this.auth.verify(token);
    return true;
  }
}

export const CurrentStaff = createParamDecorator((_: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest<StaffRequest>().staff!);
