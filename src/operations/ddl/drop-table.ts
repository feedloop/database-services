import { Transaction } from 'sequelize';
import { sequelize } from '../../config/database';
import MetadataTableRepository from '../../repositories/metadata-table-repository';
import { validIdentifier } from '../../utils/validation';

export class DropTable {
  static async execute(name: string, transaction: Transaction) {
    if (!validIdentifier(name)) throw new Error('Invalid table name');

    const tableExists = await MetadataTableRepository.findOne(
      {
        table_name: name,
      },
      transaction,
    );
    if (!tableExists) throw new Error(`Table ${name} does not exist`);

    await sequelize.query(`DROP TABLE IF EXISTS "${name}" CASCADE`, {
      transaction,
    });

    await MetadataTableRepository.delete({ table_name: name }, transaction);

    transaction.afterCommit(() => {
      console.log(`Table "${name}" deleted from metadata.`);
    });
  }
}
