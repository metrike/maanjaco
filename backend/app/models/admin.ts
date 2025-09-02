import hash from '@adonisjs/core/services/hash'
import { compose } from '@adonisjs/core/helpers'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import { DbAccessTokensProvider } from '@adonisjs/auth/access_tokens'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserProgress from '#models/user_progress'



export default class User extends BaseModel {
  public static table = 'admins'

  @column({ isPrimary: true })
  declare id: number

  @column()
  declare username: string

}
