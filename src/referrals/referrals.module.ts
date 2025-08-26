import { Module } from '@nestjs/common'
import { ReferralsService } from './referrals.service'
import { ReferralsController } from './referrals.controller'
import { User, UserSchema } from 'src/schemas/user.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { Action, ActionSchema } from 'src/schemas/action.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Action.name, schema: ActionSchema }]),
  ],
  controllers: [ReferralsController],
  providers: [ReferralsService],
})
export class ReferralsModule {}
