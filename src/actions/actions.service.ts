import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Action } from 'src/schemas/action.schema'

@Injectable()
export class ActionsService {
  constructor(
    @InjectModel(Action.name) private readonly actionsModel: Model<Action>,
  ) {}

  async findUserActions({
    userId,
    limit = 20,
    page = 1,
  }: {
    userId: Types.ObjectId
    limit?: number
    page?: number
  }) {
    const actions = await this.actionsModel
      .find({ user: userId })
      .select('-invoicePayload -chargeId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate({
        path: 'prize',
        select: '-weightMultiplier -id',
      })
    const count = await this.actionsModel.countDocuments({ user: userId })

    return { actions, hasNext: page * limit < count }
  }
}
