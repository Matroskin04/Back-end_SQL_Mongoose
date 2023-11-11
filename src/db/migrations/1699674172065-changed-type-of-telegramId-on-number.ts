import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedTypeOfTelegramIdOnNumber1699674172065 implements MigrationInterface {
    name = 'ChangedTypeOfTelegramIdOnNumber1699674172065'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" DROP COLUMN "telegramId"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" ADD "telegramId" integer`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" DROP COLUMN "codeConfirmation"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" ADD "codeConfirmation" uuid NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" DROP COLUMN "codeConfirmation"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" ADD "codeConfirmation" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" DROP COLUMN "telegramId"`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_tg_bot" ADD "telegramId" character varying`);
    }

}
