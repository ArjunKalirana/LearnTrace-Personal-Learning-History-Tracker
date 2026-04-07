-- CreateIndex
CREATE INDEX "learning_entries_user_id_completion_date_idx" ON "learning_entries"("user_id", "completion_date" DESC);

-- CreateIndex
CREATE INDEX "learning_entries_user_id_domain_idx" ON "learning_entries"("user_id", "domain");

-- CreateIndex
CREATE INDEX "learning_entries_user_id_platform_idx" ON "learning_entries"("user_id", "platform");

-- CreateIndex
CREATE INDEX "learning_entries_user_id_created_at_idx" ON "learning_entries"("user_id", "created_at" DESC);
