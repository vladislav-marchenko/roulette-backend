import { Controller, Get, Post, UseGuards } from '@nestjs/common'
import { TransactionsService } from './transactions.service'
import { AuthGuard } from 'src/auth/auth.guard'

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
  deposit() {
    return this.transactionsService.deposit()
  }

  @Post('withdraw')
  @UseGuards(AuthGuard)
  withdraw() {
    return this.transactionsService.withdraw()
  }
}
