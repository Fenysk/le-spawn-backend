import { Module } from '@nestjs/common';
import { AuthController } from '@/auth/auth.controller';
import { AuthService } from '@/auth/auth.service';
import { UsersModule } from '@/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from '@/auth/strategies/local.strategy';
import { JwtAccessStrategy } from '@/auth/strategies/jwt-access.strategy';
import { JwtRefreshStrategy } from '@/auth/strategies/jwt-refresh.strategy';
import { GoogleStrategy } from '@/auth/strategies/google.strategy';
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
