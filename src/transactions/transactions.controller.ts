import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  findUserTransactions(@Request() request: AuthRequest) {
    return this.transactionsService.findUserTransactions(request.user._id)
  }

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
  withdraw() {
    return this.transactionsService.withdraw()
  }
}
