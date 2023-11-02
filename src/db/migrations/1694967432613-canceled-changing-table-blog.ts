import { MigrationInterface, QueryRunner } from "typeorm";

export class CanceledChangingTableBlog1694967432613 implements MigrationInterface {
    name = 'CanceledChangingTableBlog1694967432613'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "example"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" ADD "example" character varying`);
    }

}
