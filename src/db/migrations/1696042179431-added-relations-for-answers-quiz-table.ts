import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedRelationsForAnswersQuizTable1696042179431 implements MigrationInterface {
    name = 'AddedRelationsForAnswersQuizTable1696042179431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."answer_quiz_answerstatus_enum" AS ENUM('0', '1')`);
        await queryRunner.query(`CREATE TABLE "answer_quiz" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "answerStatus" "public"."answer_quiz_answerstatus_enum" NOT NULL, "addedAt" TIMESTAMP NOT NULL DEFAULT now(), "quizId" uuid NOT NULL, "userId" uuid NOT NULL, "questionId" uuid NOT NULL, CONSTRAINT "REL_7fc7d21773df0b75ea1bd2d479" UNIQUE ("userId"), CONSTRAINT "PK_a1c1317ad2a0cde96f1232f7bef" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "numberAnswers1"`);
        await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "numberAnswers2"`);
        await queryRunner.query(`ALTER TABLE "answer_quiz" ADD CONSTRAINT "FK_f887ac1d68a7d3a5b3cfcdaa521" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer_quiz" ADD CONSTRAINT "FK_7fc7d21773df0b75ea1bd2d4791" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "answer_quiz" ADD CONSTRAINT "FK_a69cba15226ae20e369355fa593" FOREIGN KEY ("questionId") REFERENCES "question_quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "answer_quiz" DROP CONSTRAINT "FK_a69cba15226ae20e369355fa593"`);
        await queryRunner.query(`ALTER TABLE "answer_quiz" DROP CONSTRAINT "FK_7fc7d21773df0b75ea1bd2d4791"`);
        await queryRunner.query(`ALTER TABLE "answer_quiz" DROP CONSTRAINT "FK_f887ac1d68a7d3a5b3cfcdaa521"`);
        await queryRunner.query(`ALTER TABLE "quiz" ADD "numberAnswers2" smallint NOT NULL`);
        await queryRunner.query(`ALTER TABLE "quiz" ADD "numberAnswers1" smallint NOT NULL`);
        await queryRunner.query(`DROP TABLE "answer_quiz"`);
        await queryRunner.query(`DROP TYPE "public"."answer_quiz_answerstatus_enum"`);
    }

}
