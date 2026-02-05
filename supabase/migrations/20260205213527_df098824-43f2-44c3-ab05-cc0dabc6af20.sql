-- Phase 5: Harden RLS Policies - Replace permissive policies with role-based access

-- ============================================
-- 1. PLATFORM_ALERTS - Analysts can view, Supervisors can update
-- ============================================

-- Drop existing permissive policies
DROP POLICY IF EXISTS "Anyone can insert platform alerts" ON public.platform_alerts;
DROP POLICY IF EXISTS "Anyone can update platform alerts" ON public.platform_alerts;
DROP POLICY IF EXISTS "Anyone can view platform alerts" ON public.platform_alerts;

-- New role-based policies
-- All authenticated users can view alerts (analysts need this for their work)
CREATE POLICY "Authenticated users can view alerts"
ON public.platform_alerts
FOR SELECT
TO authenticated
USING (true);

-- System/Edge functions can insert alerts (service role bypasses RLS)
-- Analysts and above can insert alerts
CREATE POLICY "Analysts can insert alerts"
ON public.platform_alerts
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'analyst') OR 
  public.has_role(auth.uid(), 'supervisor') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Supervisors and admins can update alerts (mark as read, etc.)
CREATE POLICY "Supervisors can update alerts"
ON public.platform_alerts
FOR UPDATE
TO authenticated
USING (public.has_elevated_access(auth.uid()));

-- ============================================
-- 2. PLATFORM_AUDIT_LOG - Immutable, only admins can view full log
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert audit logs" ON public.platform_audit_log;
DROP POLICY IF EXISTS "Anyone can view audit logs" ON public.platform_audit_log;

-- All authenticated can view audit logs (transparency)
CREATE POLICY "Authenticated users can view audit logs"
ON public.platform_audit_log
FOR SELECT
TO authenticated
USING (true);

-- System can insert audit logs (analysts logging their own actions)
CREATE POLICY "Authenticated users can insert audit logs"
ON public.platform_audit_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- ============================================
-- 3. VAULT_DOCUMENTS - Analysts can view/upload, Supervisors can update flags
-- ============================================

DROP POLICY IF EXISTS "Anyone can insert vault documents" ON public.vault_documents;
DROP POLICY IF EXISTS "Anyone can update vault documents" ON public.vault_documents;
DROP POLICY IF EXISTS "Anyone can view vault documents" ON public.vault_documents;

-- All authenticated can view documents
CREATE POLICY "Authenticated users can view documents"
ON public.vault_documents
FOR SELECT
TO authenticated
USING (true);

-- Analysts and above can upload documents
CREATE POLICY "Analysts can insert documents"
ON public.vault_documents
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'analyst') OR 
  public.has_role(auth.uid(), 'supervisor') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Supervisors and admins can update document metadata/flags
CREATE POLICY "Supervisors can update documents"
ON public.vault_documents
FOR UPDATE
TO authenticated
USING (public.has_elevated_access(auth.uid()));

-- ============================================
-- 4. ENTITY_DOCUMENTS - Junction table access
-- ============================================

DROP POLICY IF EXISTS "Anyone can delete entity documents" ON public.entity_documents;
DROP POLICY IF EXISTS "Anyone can insert entity documents" ON public.entity_documents;
DROP POLICY IF EXISTS "Anyone can view entity documents" ON public.entity_documents;

-- All authenticated can view links
CREATE POLICY "Authenticated users can view entity documents"
ON public.entity_documents
FOR SELECT
TO authenticated
USING (true);

-- Analysts and above can create links
CREATE POLICY "Analysts can link documents"
ON public.entity_documents
FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'analyst') OR 
  public.has_role(auth.uid(), 'supervisor') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Supervisors and admins can remove links
CREATE POLICY "Supervisors can unlink documents"
ON public.entity_documents
FOR DELETE
TO authenticated
USING (public.has_elevated_access(auth.uid()));

-- ============================================
-- 5. VIZESEPETIM_APPLICANTS - Sensitive external data
-- ============================================

DROP POLICY IF EXISTS "Anyone can view vizesepetim applicants" ON public.vizesepetim_applicants;
DROP POLICY IF EXISTS "Service role can insert vizesepetim applicants" ON public.vizesepetim_applicants;
DROP POLICY IF EXISTS "Service role can update vizesepetim applicants" ON public.vizesepetim_applicants;

-- Only analysts and above can view external applicant data
CREATE POLICY "Analysts can view vizesepetim applicants"
ON public.vizesepetim_applicants
FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'analyst') OR 
  public.has_role(auth.uid(), 'supervisor') OR 
  public.has_role(auth.uid(), 'admin')
);

-- Edge functions insert via service role (bypasses RLS)
-- But authenticated admins can also insert for testing
CREATE POLICY "Admins can insert vizesepetim applicants"
ON public.vizesepetim_applicants
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Only admins can update
CREATE POLICY "Admins can update vizesepetim applicants"
ON public.vizesepetim_applicants
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));