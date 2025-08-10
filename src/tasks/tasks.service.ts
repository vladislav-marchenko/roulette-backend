import { BadRequestException, Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { CompletedTask } from 'src/schemas/completed-task.schema'
import { Task } from 'src/schemas/task.schema'
import { Query } from 'src/types'

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
    @InjectModel(CompletedTask.name)
    private readonly completedTaskModel: Model<CompletedTask>,
  ) {}

  async findAll() {
    const tasks = await this.taskModel.find()
    return tasks
  }

  async check({
    userId,
    taskCode,
  }: {
    userId: Types.ObjectId
    taskCode: string
  }) {
    const task = await this.taskModel.findOne({ code: taskCode })

    if (!task) {
      throw new BadRequestException('Task not found')
    }

    const query: Query = { taskCode, user: userId }
    if (task.type === 'daily') {
      query.createdAt = { $gte: new Date().setHours(0, 0, 0, 0) }
    }

    const exists = await this.completedTaskModel.exists(query)
    return !!exists
  }

  async create({
    userId,
    taskCode,
  }: {
    userId: Types.ObjectId
    taskCode: string
  }) {
    try {
      const isCompleted = await this.check({ userId, taskCode })
      if (isCompleted) return

      return await this.completedTaskModel.create({ taskCode, user: userId })
    } catch (error) {
      // We catch errors here because this check function is called within multiple other functions,
      // and we don't want to propagate errors from this check to the client.
      // if (error instanceof BadRequestException) throw error
    }
  }
}
