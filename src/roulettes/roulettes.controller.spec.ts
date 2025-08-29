import { Test, TestingModule } from '@nestjs/testing'
import { RouletteController } from './roulettes.controller'
import { RouletteService } from './roulettes.service'

describe('RouletteController', () => {
  let controller: RouletteController

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RouletteController],
      providers: [RouletteService],
    }).compile()

    controller = module.get<RouletteController>(RouletteController)
  })

  it('should be defined', () => {
    expect(controller).toBeDefined()
  })
})
