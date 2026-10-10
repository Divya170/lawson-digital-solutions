import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { config } from '../config';
import { StaffUser } from '../database/entities';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { StaffAuthGuard } from './staff-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffUser]),
    JwtModule.register({ secret: config.jwtSecret, signOptions: { expiresIn: `${config.sessionHours}h` } }),
  ],
  controllers: [AuthController],
  providers: [AuthService, StaffAuthGuard],
  exports: [AuthService, StaffAuthGuard],
})
export class AuthModule {}
