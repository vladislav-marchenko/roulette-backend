import { Controller, Get } from '@nestjs/common'
import { PrizesService } from './prizes.service'

@Controller('prizes')
export class PrizesController {
  constructor(private readonly prizesService: PrizesService) {}

  @Get()
  findAll() {
    return this.prizesService.findAll()
  }
}
