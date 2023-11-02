import { MigrationInterface, QueryRunner } from "typeorm";

export class DeletedNumbersOfAnswerFromQuizInfoTable1696332912545 implements MigrationInterface {
    name = 'DeletedNumbersOfAnswerFromQuizInfoTable1696332912545'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" DROP COLUMN "numberOfAnswers"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz_info_about_user" ADD "numberOfAnswers" smallint NOT NULL DEFAULT '0'`);
    }

}
