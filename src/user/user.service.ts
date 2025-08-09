import { Injectable } from '@nestjs/common'
import { User } from 'src/schemas/user.schema'

@Injectable()
export class UserService {
  getMe(user: User) {
    return user
  }
}
