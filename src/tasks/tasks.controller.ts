import {
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common'
import { TasksService } from './tasks.service'
import { AuthGuard } from 'src/auth/auth.guard'
import { AuthRequest } from 'src/types'

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll() {
    return this.tasksService.findAll()
  }

  @Post(':code/check')
  @UseGuards(AuthGuard)
  check(@Request() request: AuthRequest, @Param('code') taskCode: string) {
    return this.tasksService.check({ userId: request.user._id, taskCode })
  }
}
