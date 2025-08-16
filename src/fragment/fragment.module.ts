import { Module } from '@nestjs/common'
import { FragmentService } from './fragment.service'
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [HttpModule],
  providers: [FragmentService],
  exports: [FragmentService],
})
export class FragmentModule {}
