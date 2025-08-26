import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { Action } from 'src/schemas/action.schema'
import { User } from 'src/schemas/user.schema'

@Injectable()
export class ReferralsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Action.name) private readonly actionModel: Model<User>,
  ) {}

  async getMyReferralStats(userId: Types.ObjectId) {
    const referralsCount = await this.userModel.countDocuments({
      invitedBy: userId,
    })

    const earned = await this.actionModel.aggregate([
      { $match: { type: 'referral', user: userId } },
      { $group: { _id: null, amount: { $sum: '$amount' } } },
    ])

    return { amount: referralsCount, earned: earned[0]?.amount || 0 }
  }
}
