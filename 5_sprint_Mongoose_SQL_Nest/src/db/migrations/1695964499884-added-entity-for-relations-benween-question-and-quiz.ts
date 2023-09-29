import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedEntityForRelationsBetweenQuestionAndQuiz1695964499884 implements MigrationInterface {
    name = 'AddedEntityForRelationsBetweenQuestionAndQuiz1695964499884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "question_quiz" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "body" character varying(500), "correctAnswers" text, "published" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP, CONSTRAINT "PK_aecfc55f7d8e7bb703193e03118" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "question_quiz_connection" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quizId" uuid NOT NULL, "questionId" uuid NOT NULL, CONSTRAINT "PK_1c6ff8c66a188c4158d670b7ef7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "question_quiz_connection" ADD CONSTRAINT "FK_3c690d86be04aa9e5fb49ffc8bd" FOREIGN KEY ("quizId") REFERENCES "quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "question_quiz_connection" ADD CONSTRAINT "FK_5dfff7428cb4044f53866f45eef" FOREIGN KEY ("questionId") REFERENCES "question_quiz"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_quiz_connection" DROP CONSTRAINT "FK_5dfff7428cb4044f53866f45eef"`);
        await queryRunner.query(`ALTER TABLE "question_quiz_connection" DROP CONSTRAINT "FK_3c690d86be04aa9e5fb49ffc8bd"`);
        await queryRunner.query(`DROP TABLE "question_quiz_connection"`);
        await queryRunner.query(`DROP TABLE "question_quiz"`);
    }

}
