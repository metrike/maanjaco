import { DateTime } from 'luxon'
import {BaseModel, belongsTo, column} from '@adonisjs/lucid/orm'
import User from "#models/user";
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Work from "#models/work";

export default class UserWorkFavorite extends BaseModel {
  @column({ isPrimary: true })
  declare id: string

  @column()
  declare userId: string

  @column()
  declare workId: string

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Work)
  declare work: BelongsTo<typeof Work>
}
