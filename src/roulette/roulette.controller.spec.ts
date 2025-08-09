import { Test, TestingModule } from '@nestjs/testing';
import { RouletteController } from './roulette.controller';
import { RouletteService } from './roulette.service';

describe('RouletteController', () => {
  let controller: RouletteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouletteController],
      providers: [RouletteService],
    }).compile();

    controller = module.get<RouletteController>(RouletteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
