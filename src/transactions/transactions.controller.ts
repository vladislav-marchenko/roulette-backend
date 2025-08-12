import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  @UseGuards(AuthGuard)
  findUserTransactions() {
    return this.transactionsService.findUserTransactions()
  }

  @Post('deposit')
  @UseGuards(AuthGuard)
  deposit(
    @Request() request: AuthRequest,
    @Body() { amount }: { amount: number },
  ) {
    return this.transactionsService.deposit({
      userId: request.user._id.toString(),
      amount,
    })
  }

  @Post('withdraw')
  @UseGuards(AuthGuard)
  withdraw() {
    return this.transactionsService.withdraw()
  }
}
