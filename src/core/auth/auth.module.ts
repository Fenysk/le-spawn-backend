import { Module } from '@nestjs/common';
import { AuthController } from '@/core/auth/auth.controller';
import { AuthService } from '@/core/auth/auth.service';
import { UsersModule } from '@/core/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from '@/core/auth/strategies/local.strategy';
import { JwtAccessStrategy } from '@/core/auth/strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from '@/core/auth/strategies/jwt-refresh.strategy';
import { GoogleStrategy } from '@/core/auth/strategies/google.strategy';
import { CommonModule } from '@/common/common.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  imports: [
    PassportModule,
    JwtModule,
    UsersModule,
    CommonModule,
  ],
  controllers: [
    AuthController
  ],
  providers: [
    LocalStrategy,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    AuthService,
  ],
})
export class AuthModule { }
