-- AlterTable
ALTER TABLE "usuarios" ADD COLUMN     "failed_login_attempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "locked_until" TIMESTAMP(3),
ADD COLUMN     "reset_requested_at" TIMESTAMP(3);
