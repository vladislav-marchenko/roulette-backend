import { Controller } from '@nestjs/common';
import { CompletedTasksService } from './completed-tasks.service';

@Controller('completed-tasks')
export class CompletedTasksController {
  constructor(private readonly completedTasksService: CompletedTasksService) {}
}
