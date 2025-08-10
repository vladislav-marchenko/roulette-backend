import { Request } from 'express'
import { InitData } from '@telegram-apps/init-data-node'
import { UserDocument } from 'src/schemas/user.schema'

export interface AuthRequest extends Request {
  user: UserDocument & InitData['user']
}

export type Query = { [key: string]: unknown }
