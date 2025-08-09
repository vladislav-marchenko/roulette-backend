import { Module } from '@nestjs/common'
import { PrizesService } from './prizes.service'
import { PrizesController } from './prizes.controller'
import { MongooseModule } from '@nestjs/mongoose'
import { Prize, PrizeSchema } from 'src/schemas/prize.schema'

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Prize.name, schema: PrizeSchema }]),
  ],
  controllers: [PrizesController],
  providers: [PrizesService],
  exports: [PrizesService],
})
export class PrizesModule {}
