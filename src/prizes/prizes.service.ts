import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Prize } from 'src/schemas/prize.schema'

@Injectable()
export class PrizesService {
  constructor(
    @InjectModel(Prize.name) private readonly prizeModel: Model<Prize>,
  ) {}

  async findAll() {
    const prizes = await this.prizeModel.find().select('-weightMultiplier')
    if (!prizes.length) throw new NotFoundException('Prizes not found')

    return prizes
  }
}
