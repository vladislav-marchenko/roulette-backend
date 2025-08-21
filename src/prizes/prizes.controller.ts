import { Controller, Get, Query } from '@nestjs/common'
import { PrizesService } from './prizes.service'

@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @Get()
  findAll(@Query('sort') sort?: string) {
    return this.prizesService.findAll('-weightMultiplier', sort)
  }
}
