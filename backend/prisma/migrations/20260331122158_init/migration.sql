-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reset_token" TEXT,
    "reset_token_expiry" TIMESTAMP(3),
    "refresh_token" TEXT,
    "public_profile_id" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "sub_domain" TEXT,
    "hours_spent" INTEGER,
    "start_date" TIMESTAMP(3) NOT NULL,
    "completion_date" TIMESTAMP(3) NOT NULL,
    "skills" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "description" TEXT,
    "reflection" TEXT,
    "certificate_path" TEXT,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "difficulty" TEXT,
    "rating" INTEGER,
    "resource_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "learning_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_public_profile_id_key" ON "users"("public_profile_id");

-- AddForeignKey
ALTER TABLE "learning_entries" ADD CONSTRAINT "learning_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
