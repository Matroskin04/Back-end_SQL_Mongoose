import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedQuestionQuiz1695916070310 implements MigrationInterface {
    name = 'AddedQuestionQuiz1695916070310'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "questions_quiz" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "body" character varying(500), "correctAnswers" text, "published" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP, CONSTRAINT "PK_46b3c125e02f7242662e4ccb307" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "questions_quiz"`);
    }

}
