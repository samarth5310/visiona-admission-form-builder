
-- Create storage bucket for application documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('application-documents', 'application-documents', true);

-- Create storage policies for the application-documents bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'application-documents');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'application-documents');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'application-documents');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'application-documents');
