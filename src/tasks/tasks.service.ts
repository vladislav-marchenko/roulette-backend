import { Inject, Injectable } from '@nestjs/common'
import { InjectModel, ModelDefinition } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { Task } from 'src/schemas/task.schema'

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private readonly taskModel: Model<Task>,
  ) {}

  async findAll() {
    const tasks = await this.taskModel.find()
    return tasks
  }
}
