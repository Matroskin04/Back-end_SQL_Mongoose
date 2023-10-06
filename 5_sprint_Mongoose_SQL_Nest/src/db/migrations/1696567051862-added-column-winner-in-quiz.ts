import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedColumnWinnerInQuiz1696567051862 implements MigrationInterface {
    name = 'AddedColumnWinnerInQuiz1696567051862'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" ADD "winner" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "winner"`);
    }

}
