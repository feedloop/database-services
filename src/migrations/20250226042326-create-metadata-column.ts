import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface: QueryInterface, sequelize: Sequelize) {
    await queryInterface.createTable('metadata_column', {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
      },
      table_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'metadata_table',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      column_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      data_type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      is_nullable: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      is_unique: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('metadata_column');
  },
};
