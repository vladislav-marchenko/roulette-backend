import { Controller, Post, UseGuards } from '@nestjs/common'
import { RewardsService } from './rewards.service'
import { AuthGuard } from 'src/auth/auth.guard'

@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}
}
