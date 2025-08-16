import { Module } from '@nestjs/common'
import { User, UserSchema } from 'src/schemas/user.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { TasksModule } from 'src/tasks/tasks.module'
import { BotModule } from 'src/bot/bot.module'
import { FragmentModule } from 'src/fragment/fragment.module'
import { TransactionsController } from './transactions.controller'
import { TransactionsService } from './transactions.service'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TasksModule,
    BotModule,
    FragmentModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
})
export class TransactionsModule {}
