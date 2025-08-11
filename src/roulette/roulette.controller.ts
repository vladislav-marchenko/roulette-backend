import { Controller, Post, Request, UseGuards } from '@nestjs/common'
import { RouletteService } from './roulette.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'

@Controller('roulette')
export class RouletteController {
  constructor(private readonly rouletteService: RouletteService) {}

  @Post('spin')
  @UseGuards(AuthGuard)
  spin(@Request() request: AuthRequest) {
    return this.rouletteService.spin(request.user._id)
  }
}
