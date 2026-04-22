-- AlterTable
ALTER TABLE "users" ADD COLUMN "year_of_study" TEXT;
ALTER TABLE "users" ADD COLUMN "assigned_class" TEXT;

-- AlterDefault (emailVerified default changes from true to false for new rows only)
ALTER TABLE "users" ALTER COLUMN "email_verified" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "users_college_name_department_role_idx" ON "users"("college_name", "department", "role");
