import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedColumnToBlogExample1694967143654 implements MigrationInterface {
    name = 'AddedColumnToBlogExample1694967143654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" ADD "example" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "blogs" DROP COLUMN "example"`);
    }

}
