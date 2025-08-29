import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './schemas/user.schema'
import { UserModule } from './user/user.module'
import { RoulettesModule } from './roulettes/roulettes.module'
import { RewardsModule } from './rewards/rewards.module'
import { TasksModule } from './tasks/tasks.module'
import { ActionsModule } from './actions/actions.module'
import { BotModule } from './bot/bot.module'
import { GramjsModule } from './gramjs/gramjs.module'
import { TransactionsModule } from './transactions/transactions.module'
import { BullModule } from '@nestjs/bullmq'
import { PromocodesModule } from './promocodes/promocodes.module'
import { ReferralsModule } from './referrals/referrals.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@localhost:27017/giftica`,
    ),
    BullModule.forRoot({ connection: { host: 'localhost', port: 6379 } }),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
    TasksModule,
    RoulettesModule,
    RewardsModule,
    TransactionsModule,
    ActionsModule,
    BotModule,
    GramjsModule,
    PromocodesModule,
    ReferralsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
