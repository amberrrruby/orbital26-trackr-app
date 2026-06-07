-- RESUME
ALTER TABLE "Resume" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "resume_select" ON "Resume" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "resume_insert" ON "Resume" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "resume_update" ON "Resume" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "resume_delete" ON "Resume" FOR DELETE USING (auth.uid() = "userId");

-- REMINDER
ALTER TABLE "Reminder" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reminder_select" ON "Reminder" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "reminder_insert" ON "Reminder" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "reminder_update" ON "Reminder" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "reminder_delete" ON "Reminder" FOR DELETE USING (auth.uid() = "userId");

-- TIMELINE EVENT
ALTER TABLE "TimelineEvent" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_select" ON "TimelineEvent" FOR SELECT USING (auth.uid() = "userId");
CREATE POLICY "timeline_insert" ON "TimelineEvent" FOR INSERT WITH CHECK (auth.uid() = "userId");
CREATE POLICY "timeline_update" ON "TimelineEvent" FOR UPDATE USING (auth.uid() = "userId");
CREATE POLICY "timeline_delete" ON "TimelineEvent" FOR DELETE USING (auth.uid() = "userId");

-- STORAGE RLS FOR RESUMES
-- EXTRACTS: `resumes/{userId}/fileUrlUUID`
--                    ^^^^^^^^
CREATE POLICY "resume_storage_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "resume_storage_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "resume_storage_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "resume_storage_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[1]
);