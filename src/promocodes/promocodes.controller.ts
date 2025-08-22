import { Controller, Param, Post, Request, UseGuards } from '@nestjs/common'
import { PromocodesService } from './promocodes.service'
import { AuthRequest } from 'src/types'
import { AuthGuard } from 'src/auth/auth.guard'

@Controller('promocodes')
export class PromocodesController {
  constructor(private readonly promocodesService: PromocodesService) {}

  @Post(':promocode/activate')
  @UseGuards(AuthGuard)
  activate(
    @Request() request: AuthRequest,
    @Param('promocode') promocode: string,
  ) {
    return this.promocodesService.activate({
      userId: request.user._id,
      promocode,
    })
  }
}
