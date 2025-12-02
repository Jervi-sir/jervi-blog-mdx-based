/*
  Warnings:

  - You are about to drop the `BlogStat` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."BlogStat" DROP CONSTRAINT "BlogStat_slug_fkey";

-- AlterTable
ALTER TABLE "BlogPost" ADD COLUMN     "views" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "public"."BlogStat";
