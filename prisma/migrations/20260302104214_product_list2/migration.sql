-- AlterTable
ALTER TABLE `dynamic_col` MODIFY `colType` ENUM('String', 'Boolean', 'Int', 'DateTime', 'SubTable', 'Enum', 'Json') NOT NULL;
