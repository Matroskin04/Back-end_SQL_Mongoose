import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedColumnSubscriptionStatusInSubscribersOfBlog1699779294783 implements MigrationInterface {
    name = 'AddedColumnSubscriptionStatusInSubscribersOfBlog1699779294783'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."subscribers_of_blog_subscriptionstatus_enum" AS ENUM('0', '1', '2')`);
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" ADD "subscriptionStatus" "public"."subscribers_of_blog_subscriptionstatus_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "subscribers_of_blog" DROP COLUMN "subscriptionStatus"`);
        await queryRunner.query(`DROP TYPE "public"."subscribers_of_blog_subscriptionstatus_enum"`);
    }

}
