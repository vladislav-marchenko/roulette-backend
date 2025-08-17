import { Module } from '@nestjs/common'
import { UserService } from './user.service'
import { UserController } from './user.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schemas/user.schema'
import { TasksModule } from 'src/tasks/tasks.module'
import { BotModule } from 'src/bot/bot.module'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    TasksModule,
    BotModule,
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
