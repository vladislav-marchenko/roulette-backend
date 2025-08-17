import { Module } from '@nestjs/common'
import { User, UserSchema } from 'src/schemas/user.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { BotModule } from 'src/bot/bot.module'
import { FragmentModule } from 'src/fragment/fragment.module'
import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'
import { BullModule } from '@nestjs/bullmq'
import { Action, ActionSchema } from 'src/schemas/action.schema'
import { WithdrawsConsumer } from './withdraws.consumer'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Action.name, schema: ActionSchema },
    ]),
    BotModule,
    FragmentModule,
    BullModule.registerQueue({ name: 'withdraws' }),
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService, WithdrawsConsumer],
})
export class TransactionsModule {}
