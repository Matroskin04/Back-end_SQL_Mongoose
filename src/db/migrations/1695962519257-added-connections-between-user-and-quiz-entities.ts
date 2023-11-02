import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedConnectionsBetweenUserAndQuizEntities1695962519257 implements MigrationInterface {
    name = 'AddedConnectionsBetweenUserAndQuizEntities1695962519257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "questionsIds"`);
        await queryRunner.query(`ALTER TABLE "quiz" ADD "user1Id" uuid`);
        await queryRunner.query(`ALTER TABLE "quiz" ADD "user2Id" uuid`);
        await queryRunner.query(`ALTER TABLE "quiz" ADD CONSTRAINT "FK_ce0d1b8c6c3ba6a214c2d8ac547" FOREIGN KEY ("user1Id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "quiz" ADD CONSTRAINT "FK_b462b24a280de0ed8c878796cb3" FOREIGN KEY ("user2Id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "quiz" DROP CONSTRAINT "FK_b462b24a280de0ed8c878796cb3"`);
        await queryRunner.query(`ALTER TABLE "quiz" DROP CONSTRAINT "FK_ce0d1b8c6c3ba6a214c2d8ac547"`);
        await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "user2Id"`);
        await queryRunner.query(`ALTER TABLE "quiz" DROP COLUMN "user1Id"`);
        await queryRunner.query(`ALTER TABLE "quiz" ADD "questionsIds" text`);
    }

}
