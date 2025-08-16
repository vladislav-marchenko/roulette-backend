import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'
import { TransactionsService } from './transactions.service'

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('deposit')
  deposit(
    @Request() request: AuthRequest,
    @Body() { amount }: { amount: number },
  ) {
    return this.transactionsService.deposit({
      userId: request.user._id,
      amount,
    })
  }

  @Post('withdraw')
  withdraw(
    @Request() request: AuthRequest,
    @Body('quantity') quantity: number,
  ) {
    return this.transactionsService.withdraw({ user: request.user, quantity })
  }
}
