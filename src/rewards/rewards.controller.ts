import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Get('me')
  @UseGuards(AuthGuard)
  findMy(@Request() request: AuthRequest, @Query('page') page: number = 1) {
    return this.rewardsService.findByUserId({
      userId: request.user._id,
      page,
    })
  }

  @Post(':id/sell')
  @UseGuards(AuthGuard)
  sell(@Request() request: AuthRequest, @Param('id') id: string) {
    return this.rewardsService.sellById({
      userId: request.user._id,
      rewardId: id,
    })
  }

  @Post(':id/withdraw')
  @UseGuards(AuthGuard)
  withdraw(@Request() request: AuthRequest, @Param('id') id: string) {
    return this.rewardsService.sellById({
      userId: request.user._id,
      rewardId: id,
    })
  }
}
