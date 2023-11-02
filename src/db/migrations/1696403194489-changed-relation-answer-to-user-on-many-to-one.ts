import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedRelationAnswerToUserOnManyToOne1696403194489 implements MigrationInterface {
    name = 'ChangedRelationAnswerToUserOnManyToOne1696403194489'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer_quiz" DROP CONSTRAINT "FK_7fc7d21773df0b75ea1bd2d4791"`);
        await queryRunner.query(`ALTER TABLE "answer_quiz" DROP CONSTRAINT "REL_7fc7d21773df0b75ea1bd2d479"`);
        await queryRunner.query(`ALTER TABLE "answer_quiz" ADD CONSTRAINT "FK_7fc7d21773df0b75ea1bd2d4791" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer_quiz" DROP CONSTRAINT "FK_7fc7d21773df0b75ea1bd2d4791"`);
        await queryRunner.query(`ALTER TABLE "answer_quiz" ADD CONSTRAINT "REL_7fc7d21773df0b75ea1bd2d479" UNIQUE ("userId")`);
        await queryRunner.query(`ALTER TABLE "answer_quiz" ADD CONSTRAINT "FK_7fc7d21773df0b75ea1bd2d4791" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
