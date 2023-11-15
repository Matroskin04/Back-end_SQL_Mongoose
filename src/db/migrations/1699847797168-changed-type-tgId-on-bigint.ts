import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedTypeTgIdOnBigint1699847797168 implements MigrationInterface {
    name = 'ChangedTypeTgIdOnBigint1699847797168'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" DROP COLUMN "telegramId"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" ADD "telegramId" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" DROP COLUMN "telegramId"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" ADD "telegramId" integer`);
    }

}
