import { Body, Controller, Get, HttpCode, Post, Res, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { config } from '../config';
import { AuthService, StaffSession } from './auth.service';
import { CurrentStaff, StaffAuthGuard } from './staff-auth.guard';

const cookieOpts = () => ({
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: config.isProduction,
  path: '/',
});

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  /** 5 attempts per minute per IP. */
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(200)
  async login(@Body() body: Record<string, unknown>, @Res({ passthrough: true }) res: Response) {
    const { token, user } = await this.auth.login(body);
    res.cookie(config.cookieName, token, { ...cookieOpts(), maxAge: config.sessionHours * 3600_000 });
    return { user };
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(config.cookieName, cookieOpts());
    return { ok: true };
  }

  @UseGuards(StaffAuthGuard)
  @Get('me')
  me(@CurrentStaff() s: StaffSession) {
    return this.auth.me(s.sub);
  }

  @UseGuards(StaffAuthGuard)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('change-password')
  @HttpCode(200)
  changePassword(@CurrentStaff() s: StaffSession, @Body() body: Record<string, unknown>) {
    return this.auth.changePassword(s.sub, body);
  }
}
