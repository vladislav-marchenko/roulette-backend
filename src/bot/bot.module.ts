import { Module } from '@nestjs/common'
import { BotService } from './bot.service'
import { User, UserSchema } from 'src/schemas/user.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { Transaction, TransactionSchema } from 'src/schemas/transaction.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Transaction.name, schema: TransactionSchema },
    ]),
  ],
  providers: [BotService],
  exports: [BotService],
})
export class BotModule {}
