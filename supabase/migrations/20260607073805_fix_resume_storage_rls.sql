-- DROP OLD STORAGE POLICIES (index [1], which is incorrect)
DROP POLICY IF EXISTS "resume_storage_select" ON storage.objects;
DROP POLICY IF EXISTS "resume_storage_insert" ON storage.objects;
DROP POLICY IF EXISTS "resume_storage_update" ON storage.objects;
DROP POLICY IF EXISTS "resume_storage_delete" ON storage.objects;

-- STORAGE RLS FOR RESUMES
-- EXTRACTS: `resumes/[FilesOrThumbnails]/{userId}/fileUrlUUID`
--                                        ^^^^^^^^
CREATE POLICY "resume_storage_select" ON storage.objects FOR SELECT USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[2]
);
CREATE POLICY "resume_storage_insert" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[2]
);
CREATE POLICY "resume_storage_update" ON storage.objects FOR UPDATE USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[2]
);
CREATE POLICY "resume_storage_delete" ON storage.objects FOR DELETE USING (
  bucket_id = 'resumes' AND auth.uid()::text = (storage.foldername(name))[2]
);