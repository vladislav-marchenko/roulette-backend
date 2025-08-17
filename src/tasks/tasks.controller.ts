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
@UseGuards(AuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  findAll(@Request() request: AuthRequest) {
    return this.tasksService.findAll({ userId: request.user._id })
  }

  @Post(':code/check')
  check(@Request() request: AuthRequest, @Param('code') taskCode: string) {
    return this.tasksService.check({ userId: request.user._id, taskCode })
  }

  @Post(':code/claim')
  claim(@Request() request: AuthRequest, @Param('code') taskCode: string) {
    return this.tasksService.claim({ userId: request.user._id, taskCode })
  }
}
