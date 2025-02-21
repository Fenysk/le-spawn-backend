import { Controller, Delete, Get, Param, Patch, Query } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { Profile, User } from '@prisma/client';
import { GetUser } from '@/common/decorator/get-user.decorator';
import { UpdateMyProfileRequest } from '@/users/dto/update-my-profile.request';
import { Public } from '@/common/decorator/public.decorator';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @Public()
    @Get('check-pseudo')
    checkIfPseudoAlreadyUsed(
        @Query('pseudo') pseudo: string
    ): Promise<void> {
        return this.usersService.checkIfPseudoAlreadyUsed({ pseudo });
    }

    @Get('profile/:userId')
    getUserProfile(
        @Param('userId') userId: string,
    ): Promise<User & { profile: Profile }> {
        return this.usersService.findUser({ id: userId });
    }

    @Get('my-profile')
    getMyProfile(
        @GetUser() user: User
    ): Promise<User & { profile: Profile }> {
        return this.usersService.getMyProfile({ user });
    }

    @Patch('my-profile')
    updateMyProfile(
        @GetUser() user: User,
        @Query() updateMyProfileRequest: UpdateMyProfileRequest
    ): Promise<User & { profile: Profile }> {
        return this.usersService.updateMyProfile({ user, updateMyProfileRequest });
    }

    @Delete('my-profile')
    deleteMyProfile(
        @GetUser() user: User
    ): Promise<string> {
        return this.usersService.deleteMyProfile({ user });
    }
}
