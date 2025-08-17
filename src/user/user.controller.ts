import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { UserService } from './user.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('auth')
  @UseGuards(AuthGuard)
  auth(@Request() request: AuthRequest) {
    return this.userService.auth(request.user)
  }

  @Get('me')
  @UseGuards(AuthGuard)
  findMe(@Request() request: AuthRequest) {
    return this.userService.getMe(request.user)
  }
}
