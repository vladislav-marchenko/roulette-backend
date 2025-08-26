import { Processor, WorkerHost } from '@nestjs/bullmq'
import { InjectModel } from '@nestjs/mongoose'
import { Job } from 'bullmq'
import { ClientSession, Model, Types } from 'mongoose'
import { FragmentService } from 'src/fragment/fragment.service'
import { Action } from 'src/schemas/action.schema'

@Processor('withdraws')
export class WithdrawsConsumer extends WorkerHost {
  constructor(
    @InjectModel(Action.name) private readonly actionsModel: Model<Action>,
    private readonly fragmentService: FragmentService,
  ) {
    super()
  }

  async process(
    job: Job<{
      username: string
      quantity: number
      actionId: Types.ObjectId
      session: ClientSession
    }>,
  ) {
    const {
      data: { username, quantity, actionId, session },
    } = job
    console.log(`Sending ${quantity} stars to @${username}`)

    await this.fragmentService.sendStars({ username, quantity })
    await this.actionsModel
      .findByIdAndUpdate(actionId, {
        status: 'success',
      })
      .session(session)

    return true
  }
}
