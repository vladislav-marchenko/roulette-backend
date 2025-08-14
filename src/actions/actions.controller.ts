import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common'
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

  @Post('deposit')
  deposit(
    @Request() request: AuthRequest,
    @Body() { amount }: { amount: number },
  ) {
    return this.actionsService.deposit({
      userId: request.user._id,
      amount,
    })
  }

  @Post('withdraw')
  withdraw() {
    return this.actionsService.withdraw()
  }
}
