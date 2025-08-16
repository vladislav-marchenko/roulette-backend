import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common'
import { ActionsService } from './actions.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'

@Controller('actions')
@UseGuards(AuthGuard)
export class ActionsController {
  constructor(private readonly actionsService: ActionsService) {}

  @Get()
  findUserActions(
    @Request() request: AuthRequest,
    @Query('page') page: number = 1,
  ) {
    return this.actionsService.findUserActions({
      userId: request.user._id,
      page,
    })
  }
}
