import { Test, TestingModule } from '@nestjs/testing';
import { CompletedTasksService } from './completed-tasks.service';

describe('CompletedTasksService', () => {
  let service: CompletedTasksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompletedTasksService],
    }).compile();

    service = module.get<CompletedTasksService>(CompletedTasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
