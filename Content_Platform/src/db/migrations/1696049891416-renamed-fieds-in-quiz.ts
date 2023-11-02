import { MigrationInterface, QueryRunner } from "typeorm";

export class RenamedFiedsInQuiz1696049891416 implements MigrationInterface {
    name = 'RenamedFiedsInQuiz1696049891416'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "userId1"`);
        await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "userId2"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" ADD "userId2" uuid`);
        await queryRunner.query(`ALTER TABLE "quiz" ADD "userId1" uuid`);
    }

}
