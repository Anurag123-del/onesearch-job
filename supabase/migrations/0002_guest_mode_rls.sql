-- Grant read-only access to jobs and companies for anonymous users
CREATE POLICY "jobs_are_readable_by_anon" ON jobs FOR SELECT TO anon USING (true);
CREATE POLICY "companies_are_readable_by_anon" ON companies FOR SELECT TO anon USING (true);
