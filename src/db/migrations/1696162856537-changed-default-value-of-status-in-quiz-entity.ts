import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedDefaultValueOfStatusInQuizEntity1696162856537 implements MigrationInterface {
    name = 'ChangedDefaultValueOfStatusInQuizEntity1696162856537'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" ALTER COLUMN "status" SET DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" ALTER COLUMN "status" SET DEFAULT '1'`);
    }

}
