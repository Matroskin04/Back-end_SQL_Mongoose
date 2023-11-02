import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedQuizEntity1695960078803 implements MigrationInterface {
    name = 'AddedQuizEntity1695960078803'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."quiz_status_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`CREATE TABLE "quiz" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId1" uuid, "userId2" uuid, "numberAnswers1" smallint NOT NULL, "numberAnswers2" smallint NOT NULL, "status" "public"."quiz_status_enum" NOT NULL, "pairCreatedDate" TIMESTAMP NOT NULL DEFAULT now(), "startGameDate" TIMESTAMP, "finishGameDate" TIMESTAMP, "questionsIds" text, CONSTRAINT "PK_422d974e7217414e029b3e641d0" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "quiz"`);
        await queryRunner.query(`DROP TYPE "public"."quiz_status_enum"`);
    }

}
