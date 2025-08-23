import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import e from 'express'
import { Connection, Model, Types } from 'mongoose'
import { PromocodeActivation } from 'src/schemas/promocode-activation.schema'
import { Promocode } from 'src/schemas/promocode.schema'
import { User } from 'src/schemas/user.schema'

@Injectable()
export class PromocodesService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Promocode.name)
    private readonly promocodeModel: Model<Promocode>,
    @InjectModel(PromocodeActivation.name)
    private readonly promocodeActivationModel: Model<PromocodeActivation>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async activate({
    userId,
    promocode,
  }: {
    userId: Types.ObjectId
    promocode: string
  }) {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const promo = await this.promocodeModel
        .findOne({ code: promocode.toLowerCase() })
        .session(session)

      if (!promo) throw new BadRequestException('Promocode not found')

      if (promo.limit !== null && promo.limit <= 0) {
        throw new BadRequestException('Promocode limit reached')
      }

      if (promo.expiresAt && new Date() > promo.expiresAt) {
        throw new BadRequestException('Promocode is expired')
      }

      const isActivated = await this.promocodeActivationModel
        .exists({ userId, promocodeId: promo._id })
        .session(session)

      if (!!isActivated) {
        throw new BadRequestException('Promocode already activated')
      }

      const user = await this.userModel.findById(userId).session(session)
      if (!user) throw new BadRequestException('User not found')

      if (promo.limit) {
        await promo.updateOne({ $inc: { limit: -1 } }).session(session)
      }

      const promocodeActivation = new this.promocodeActivationModel({
        promocodeId: promo._id,
        userId,
      })
      await promocodeActivation.save({ session })

      switch (promo.type) {
        case 'stars':
          user.balance += promo.amount
          break
        case 'spins':
          user.freeSpins.push({
            amount: promo.amount,
            expiresAt: promo.expiresAt,
          })
          break
      }

      await user.save({ session })
      await session.commitTransaction()

      const { weightMultiplier, ...userData } = user
      return userData
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }
}
