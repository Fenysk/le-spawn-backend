import { Module } from '@nestjs/common';
import { UsersService } from '@/core/users/users.service';
import { UsersController } from '@/core/users/users.controller';

@Module({
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
