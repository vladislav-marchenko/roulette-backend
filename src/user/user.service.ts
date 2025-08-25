import { Injectable } from '@nestjs/common'
import { BotService } from 'src/bot/bot.service'
import { TasksService } from 'src/tasks/tasks.service'
import { AuthRequest } from 'src/types'

@Injectable()
export class UserService {
  constructor(
    private readonly botService: BotService,
    private readonly tasksService: TasksService,
  ) {}

  async auth(user: AuthRequest['user']) {
    await this.tasksService.create({
      taskCode: 'daily_login',
      userId: user._id,
    })

    await this.tasksService.create({
      taskCode: 'invite_friend',
      userId: user.invitedBy,
    })

    await this.tasksService.create({
      taskCode: 'invite_friend',
      userId: user.invitedBy,
    })

    const isSubscribed = await this.botService.isUserSubscribed({
      userTelegramId: user.telegramId,
      channelUsername: '@giftica_official',
    })
    if (isSubscribed) {
      await this.tasksService.create({
        taskCode: 'subscribe_channel',
        userId: user._id,
      })
    }

    return this.getMe(user)
  }

  getMe(user: AuthRequest['user']) {
    const { weightMultiplier, ...userData } = user
    return userData
  }
}
