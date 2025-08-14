import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from './schemas/user.schema'
import { UserModule } from './user/user.module'
import { PrizesModule } from './prizes/prizes.module'
import { RouletteModule } from './roulette/roulette.module'
import { RewardsModule } from './rewards/rewards.module'
import { TasksModule } from './tasks/tasks.module'
import { ActionsModule } from './actions/actions.module'
import { BotModule } from './bot/bot.module'

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(
      `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@cluster0.v5ypq4y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`,
    ),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UserModule,
    TasksModule,
    PrizesModule,
    RouletteModule,
    RewardsModule,
    ActionsModule,
    BotModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
