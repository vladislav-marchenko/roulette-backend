import { Test, TestingModule } from '@nestjs/testing';
import { CompletedTasksController } from './completed-tasks.controller';
import { CompletedTasksService } from './completed-tasks.service';

describe('CompletedTasksController', () => {
  let controller: CompletedTasksController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompletedTasksController],
      providers: [CompletedTasksService],
    }).compile();

    controller = module.get<CompletedTasksController>(CompletedTasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
