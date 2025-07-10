import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_work_favorites'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').primary()
      table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE')
      table.integer('work_id').notNullable().references('id').inTable('works').onDelete('CASCADE')
      table.unique(['user_id', 'work_id']) // pour éviter les doublons
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
