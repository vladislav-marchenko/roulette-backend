import { Module } from '@nestjs/common'
import { PromocodesService } from './promocodes.service'
import { PromocodesController } from './promocodes.controller'
import { Promocode, PromocodeSchema } from 'src/schemas/promocode.schema'
import { MongooseModule } from '@nestjs/mongoose'
import { User, UserSchema } from 'src/schemas/user.schema'
import {
  PromocodeActivation,
  PromocodeActivationSchema,
} from 'src/schemas/promocode-activation.schema'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Promocode.name, schema: PromocodeSchema },
      { name: PromocodeActivation.name, schema: PromocodeActivationSchema },
    ]),
  ],
  controllers: [PromocodesController],
  providers: [PromocodesService],
})
export class PromocodesModule {}
