import { Module } from '@nestjs/common';
import { CompletedTasksService } from './completed-tasks.service';
import { CompletedTasksController } from './completed-tasks.controller';

@Module({
  controllers: [CompletedTasksController],
  providers: [CompletedTasksService],
})
export class CompletedTasksModule {}
