import { Controller, Get, Request, UseGuards } from '@nestjs/common'
import { ReferralsService } from './referrals.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('stats')
  @UseGuards(AuthGuard)
  findMyReferralStats(@Request() request: AuthRequest) {
    return this.referralsService.getMyReferralStats(request.user.id)
  }
}
