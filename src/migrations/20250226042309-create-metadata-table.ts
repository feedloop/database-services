import { QueryInterface, DataTypes, Sequelize } from 'sequelize';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface: QueryInterface, sequelize: Sequelize) {
    await queryInterface.createTable('metadata_table', {
      id: {
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: sequelize.literal('uuid_generate_v4()'),
        allowNull: false,
      },
      table_name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      created_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
        allowNull: false,
      },
    });
  },

  async down(queryInterface: QueryInterface) {
    await queryInterface.dropTable('metadata_table');
  },
};
