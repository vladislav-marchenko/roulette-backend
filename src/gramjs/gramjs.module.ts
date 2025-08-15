import { Module } from '@nestjs/common'
import { GramjsService } from './gramjs.service'

@Module({
  providers: [GramjsService],
  exports: [GramjsService],
})
export class GramjsModule {}
