import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectConnection, InjectModel } from '@nestjs/mongoose'
import { ClientSession, Connection, Model, Types } from 'mongoose'
import { TaskAction } from 'src/schemas/task-action.schema'
import { Task } from 'src/schemas/task.schema'
import { User } from 'src/schemas/user.schema'
import { Query } from 'src/types'

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(TaskAction.name)
    private readonly taskActionModel: Model<TaskAction>,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async findAll({ userId }: { userId: Types.ObjectId }) {
    const tasks = await this.taskModel.find().lean()

    const tasksWithCompletion = await Promise.all(
      tasks.map(async (task) => {
        const state = await this.check({ userId, taskCode: task.code })
        return { ...task, ...state }
      }),
    )

    return tasksWithCompletion
  }

  async check({
    userId,
    taskCode,
    session,
  }: {
    userId: Types.ObjectId
    taskCode: string
    session?: ClientSession
  }) {
    const task = await this.taskModel.findOne({ code: taskCode })

    if (!task) {
      throw new BadRequestException('Task not found')
    }

    const query: Query = { taskCode, user: userId }
    if (task.type === 'daily') {
      query.createdAt = { $gte: new Date().setHours(0, 0, 0, 0) }
    }

    const isCompleted = !!(await this.taskActionModel
      .exists({ ...query, type: 'completed' })
      .session(session))
    const isClaimed = !!(await this.taskActionModel
      .exists({ ...query, type: 'claimed' })
      .session(session))

    return { isCompleted, isClaimed }
  }

  async create({
    userId,
    taskCode,
    session,
  }: {
    userId: Types.ObjectId
    taskCode: string
    session?: ClientSession
  }) {
    try {
      const { isCompleted } = await this.check({
        userId,
        taskCode,
        session,
      })

      if (isCompleted) {
        throw new BadRequestException('Task already completed')
      }

      return await this.taskActionModel.create(
        [
          {
            taskCode,
            type: 'completed',
            user: userId,
          },
        ],
        { session },
      )
    } catch (error) {
      // We catch errors here because this function is called within multiple other functions,
      // and we don't want to propagate errors from this function to the client.
      // if (error instanceof BadRequestException) throw error
    }
  }

  async claim({
    userId,
    taskCode,
  }: {
    userId: Types.ObjectId
    taskCode: string
  }) {
    const session = await this.connection.startSession()
    session.startTransaction()

    try {
      const task = await this.taskModel
        .findOne({ code: taskCode })
        .session(session)

      if (!task) {
        throw new BadRequestException('Task not found')
      }

      const { isCompleted, isClaimed } = await this.check({
        userId,
        taskCode,
        session,
      })

      if (isClaimed) {
        throw new BadRequestException('Task already claimed')
      }

      if (!isCompleted) {
        throw new BadRequestException('Task not completed')
      }

      const taskAction = new this.taskActionModel({
        taskCode,
        type: 'claimed',
        user: userId,
      })

      await this.userModel
        .findByIdAndUpdate(userId, { $inc: { balance: task.reward } })
        .session(session)

      await taskAction.save({ session })

      await session.commitTransaction()
      return taskAction
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }
}
