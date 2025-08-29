import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { RoulettesService } from './roulettes.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'

@Controller('roulettes')
export class RoulettesController {
  constructor(private readonly roulettesService: RoulettesService) {}

  @Get()
  findAll() {
    return this.roulettesService.getRoulettes()
  }

  @Get(':code')
  findByCode(@Param('code') code: string) {
    return this.roulettesService.getRoulette(code)
  }

  @Post('spin')
  @UseGuards(AuthGuard)
  spin(@Request() request: AuthRequest) {
    return this.roulettesService.spin(request.user._id)
  }
}
