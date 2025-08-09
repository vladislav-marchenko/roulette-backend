import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  findMy(@Request() request: AuthRequest, @Query('offset') offset: number = 0) {
    return this.rewardsService.findByUserId({
      userId: request.user._id,
      offset,
    })
  }
}
