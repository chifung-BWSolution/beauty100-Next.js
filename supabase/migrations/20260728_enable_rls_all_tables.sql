-- Enable RLS on all public tables + policies aligned with app access patterns.
-- Helpers use SECURITY DEFINER to avoid RLS recursion on public.users.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND (u.role = 'admin' OR 'admin' = ANY (u.roles))
  );
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users u
    WHERE u.id = auth.uid()
      AND (
        u.role IN ('admin', 'marketing')
        OR u.roles && ARRAY['admin', 'marketing']::text[]
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_salon(p_salon_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p_salon_id IS NOT NULL AND (
    EXISTS (
      SELECT 1 FROM public.salon_profiles sp
      WHERE sp.id = p_salon_id AND sp.created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.salon_applications sa
      WHERE sa.salon_profile_id = p_salon_id
        AND sa.created_by = auth.uid()
        AND sa.status = 'approved'
    )
  );
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_staff() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owns_salon(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.is_staff() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.owns_salon(uuid) TO anon, authenticated;

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_profile_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kol_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kol_promotion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salon_qr_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_number_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payout_items ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (id = auth.uid() OR public.is_admin())
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admins can delete users" ON public.users;
CREATE POLICY "Admins can delete users"
  ON public.users FOR DELETE
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- salon_applications
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Owners and staff can view salon applications" ON public.salon_applications;
CREATE POLICY "Owners and staff can view salon applications"
  ON public.salon_applications FOR SELECT
  USING (created_by = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can create salon applications" ON public.salon_applications;
CREATE POLICY "Authenticated users can create salon applications"
  ON public.salon_applications FOR INSERT
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Owners and staff can update salon applications" ON public.salon_applications;
CREATE POLICY "Owners and staff can update salon applications"
  ON public.salon_applications FOR UPDATE
  USING (created_by = auth.uid() OR public.is_staff())
  WITH CHECK (created_by = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Staff can delete salon applications" ON public.salon_applications;
CREATE POLICY "Staff can delete salon applications"
  ON public.salon_applications FOR DELETE
  USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- salon_profiles (keep/replace existing)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can view salon profiles" ON public.salon_profiles;
CREATE POLICY "Anyone can view salon profiles"
  ON public.salon_profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert salon profiles" ON public.salon_profiles;
CREATE POLICY "Authenticated users can insert salon profiles"
  ON public.salon_profiles FOR INSERT
  WITH CHECK (auth.uid() = created_by OR public.is_staff());

DROP POLICY IF EXISTS "Owners can update their salon profiles" ON public.salon_profiles;
CREATE POLICY "Owners can update their salon profiles"
  ON public.salon_profiles FOR UPDATE
  USING (auth.uid() = created_by OR public.is_staff())
  WITH CHECK (auth.uid() = created_by OR public.is_staff());

DROP POLICY IF EXISTS "Staff can delete salon profiles" ON public.salon_profiles;
CREATE POLICY "Staff can delete salon profiles"
  ON public.salon_profiles FOR DELETE
  USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- salon_profile_versions
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow anonymous public suggestions" ON public.salon_profile_versions;
CREATE POLICY "Allow anonymous public suggestions"
  ON public.salon_profile_versions FOR INSERT
  WITH CHECK (submission_type = 'public_suggestion');

DROP POLICY IF EXISTS "Owners can insert salon profile versions" ON public.salon_profile_versions;
CREATE POLICY "Owners can insert salon profile versions"
  ON public.salon_profile_versions FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    OR public.owns_salon(profile_id)
    OR public.is_staff()
  );

DROP POLICY IF EXISTS "Owners and staff can view salon profile versions" ON public.salon_profile_versions;
CREATE POLICY "Owners and staff can view salon profile versions"
  ON public.salon_profile_versions FOR SELECT
  USING (
    created_by = auth.uid()
    OR public.owns_salon(profile_id)
    OR public.is_staff()
  );

DROP POLICY IF EXISTS "Staff can update salon profile versions" ON public.salon_profile_versions;
CREATE POLICY "Staff can update salon profile versions"
  ON public.salon_profile_versions FOR UPDATE
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Staff can delete salon profile versions" ON public.salon_profile_versions;
CREATE POLICY "Staff can delete salon profile versions"
  ON public.salon_profile_versions FOR DELETE
  USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- user_activity_logs
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can insert own activity logs" ON public.user_activity_logs;
CREATE POLICY "Users can insert own activity logs"
  ON public.user_activity_logs FOR INSERT
  WITH CHECK (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Staff can view activity logs" ON public.user_activity_logs;
CREATE POLICY "Staff can view activity logs"
  ON public.user_activity_logs FOR SELECT
  USING (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Staff can delete activity logs" ON public.user_activity_logs;
CREATE POLICY "Staff can delete activity logs"
  ON public.user_activity_logs FOR DELETE
  USING (public.is_staff());

-- ---------------------------------------------------------------------------
-- whatsapp_settings (public read for merchant pages)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read whatsapp settings" ON public.whatsapp_settings;
CREATE POLICY "Anyone can read whatsapp settings"
  ON public.whatsapp_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Staff can manage whatsapp settings" ON public.whatsapp_settings;
CREATE POLICY "Staff can manage whatsapp settings"
  ON public.whatsapp_settings FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- salon_tags
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read salon tags" ON public.salon_tags;
CREATE POLICY "Anyone can read salon tags"
  ON public.salon_tags FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Staff can manage salon tags" ON public.salon_tags;
CREATE POLICY "Staff can manage salon tags"
  ON public.salon_tags FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- blog_articles
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read active blog articles" ON public.blog_articles;
CREATE POLICY "Anyone can read active blog articles"
  ON public.blog_articles FOR SELECT
  USING (status = 'active' OR public.is_staff());

DROP POLICY IF EXISTS "Staff can manage blog articles" ON public.blog_articles;
CREATE POLICY "Staff can manage blog articles"
  ON public.blog_articles FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- kol_applications / contact_submissions / kol_promotion_requests
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can submit kol applications" ON public.kol_applications;
CREATE POLICY "Anyone can submit kol applications"
  ON public.kol_applications FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can manage kol applications" ON public.kol_applications;
CREATE POLICY "Staff can manage kol applications"
  ON public.kol_applications FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Anyone can submit contact forms" ON public.contact_submissions;
CREATE POLICY "Anyone can submit contact forms"
  ON public.contact_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can manage contact submissions" ON public.contact_submissions;
CREATE POLICY "Staff can manage contact submissions"
  ON public.contact_submissions FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Anyone can submit kol promotion requests" ON public.kol_promotion_requests;
CREATE POLICY "Anyone can submit kol promotion requests"
  ON public.kol_promotion_requests FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Staff can manage kol promotion requests" ON public.kol_promotion_requests;
CREATE POLICY "Staff can manage kol promotion requests"
  ON public.kol_promotion_requests FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- staff
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can view staff list" ON public.staff;
CREATE POLICY "Staff can view staff list"
  ON public.staff FOR SELECT
  USING (public.is_staff() OR user_id = auth.uid());

DROP POLICY IF EXISTS "Admins can manage staff" ON public.staff;
CREATE POLICY "Admins can manage staff"
  ON public.staff FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- members
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view own member row" ON public.members;
CREATE POLICY "Members can view own member row"
  ON public.members FOR SELECT
  USING (
    auth_user_id = auth.uid()
    OR public.is_staff()
    OR EXISTS (
      SELECT 1 FROM public.order_items oi
      WHERE (oi.member_id = members.id OR oi.member_id = members.auth_user_id)
        AND public.owns_salon(oi.salon_profile_id)
    )
  );

DROP POLICY IF EXISTS "Members can insert own member row" ON public.members;
CREATE POLICY "Members can insert own member row"
  ON public.members FOR INSERT
  WITH CHECK (auth_user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Members can update own member row" ON public.members;
CREATE POLICY "Members can update own member row"
  ON public.members FOR UPDATE
  USING (auth_user_id = auth.uid() OR public.is_staff())
  WITH CHECK (auth_user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Admins can delete members" ON public.members;
CREATE POLICY "Admins can delete members"
  ON public.members FOR DELETE
  USING (public.is_admin());

-- ---------------------------------------------------------------------------
-- districts
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read districts" ON public.districts;
CREATE POLICY "Anyone can read districts"
  ON public.districts FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Staff can manage districts" ON public.districts;
CREATE POLICY "Staff can manage districts"
  ON public.districts FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- tracking_codes (server uses service role; clients are staff-only)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Staff can manage tracking codes" ON public.tracking_codes;
CREATE POLICY "Staff can manage tracking codes"
  ON public.tracking_codes FOR ALL
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- salon_reviews
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read visible salon reviews" ON public.salon_reviews;
CREATE POLICY "Anyone can read visible salon reviews"
  ON public.salon_reviews FOR SELECT
  USING (is_visible = true OR user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.salon_reviews;
CREATE POLICY "Authenticated users can insert reviews"
  ON public.salon_reviews FOR INSERT
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Owners and staff can update reviews" ON public.salon_reviews;
CREATE POLICY "Owners and staff can update reviews"
  ON public.salon_reviews FOR UPDATE
  USING (user_id = auth.uid() OR public.is_staff())
  WITH CHECK (user_id = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Owners and staff can delete reviews" ON public.salon_reviews;
CREATE POLICY "Owners and staff can delete reviews"
  ON public.salon_reviews FOR DELETE
  USING (user_id = auth.uid() OR public.is_staff());

-- ---------------------------------------------------------------------------
-- treatments
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Anyone can read active treatments" ON public.treatments;
CREATE POLICY "Anyone can read active treatments"
  ON public.treatments FOR SELECT
  USING (
    status = 'active'
    OR created_by = auth.uid()
    OR public.owns_salon(salon_profile_id)
    OR public.is_staff()
  );

DROP POLICY IF EXISTS "Merchants can insert treatments" ON public.treatments;
CREATE POLICY "Merchants can insert treatments"
  ON public.treatments FOR INSERT
  WITH CHECK (created_by = auth.uid() OR public.is_staff());

DROP POLICY IF EXISTS "Merchants can update own treatments" ON public.treatments;
CREATE POLICY "Merchants can update own treatments"
  ON public.treatments FOR UPDATE
  USING (created_by = auth.uid() OR public.owns_salon(salon_profile_id) OR public.is_staff())
  WITH CHECK (created_by = auth.uid() OR public.owns_salon(salon_profile_id) OR public.is_staff());

DROP POLICY IF EXISTS "Merchants can delete own treatments" ON public.treatments;
CREATE POLICY "Merchants can delete own treatments"
  ON public.treatments FOR DELETE
  USING (created_by = auth.uid() OR public.owns_salon(salon_profile_id) OR public.is_staff());

-- ---------------------------------------------------------------------------
-- system_settings
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can read system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Anyone can read system settings" ON public.system_settings;
CREATE POLICY "Anyone can read system settings"
  ON public.system_settings FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admin can update system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
CREATE POLICY "Admins can manage system settings"
  ON public.system_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- cart_items
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members manage own cart items" ON public.cart_items;
CREATE POLICY "Members manage own cart items"
  ON public.cart_items FOR ALL
  USING (member_id = auth.uid())
  WITH CHECK (member_id = auth.uid());

-- ---------------------------------------------------------------------------
-- orders / order_items (extend existing)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Members can view own orders" ON public.orders;
CREATE POLICY "Members can view own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = member_id OR public.is_staff() OR public.owns_salon(salon_profile_id));

DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Service role full access orders" ON public.orders;
CREATE POLICY "Service role full access orders"
  ON public.orders FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Staff can update orders" ON public.orders;
CREATE POLICY "Staff can update orders"
  ON public.orders FOR UPDATE
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

DROP POLICY IF EXISTS "Members can view own order items" ON public.order_items;
CREATE POLICY "Members can view own order items"
  ON public.order_items FOR SELECT
  USING (auth.uid() = member_id OR public.is_staff() OR public.owns_salon(salon_profile_id));

DROP POLICY IF EXISTS "Admins can view all order_items" ON public.order_items;
DROP POLICY IF EXISTS "Service role full access order_items" ON public.order_items;
CREATE POLICY "Service role full access order_items"
  ON public.order_items FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Staff can update order items" ON public.order_items;
CREATE POLICY "Staff can update order items"
  ON public.order_items FOR UPDATE
  USING (public.is_staff())
  WITH CHECK (public.is_staff());

-- ---------------------------------------------------------------------------
-- salon_qr_codes
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Merchants and staff can view salon qr codes" ON public.salon_qr_codes;
CREATE POLICY "Merchants and staff can view salon qr codes"
  ON public.salon_qr_codes FOR SELECT
  USING (public.owns_salon(salon_profile_id) OR public.is_staff());

DROP POLICY IF EXISTS "Merchants and staff can manage salon qr codes" ON public.salon_qr_codes;
CREATE POLICY "Merchants and staff can manage salon qr codes"
  ON public.salon_qr_codes FOR ALL
  USING (public.owns_salon(salon_profile_id) OR public.is_staff())
  WITH CHECK (public.owns_salon(salon_profile_id) OR public.is_staff());

-- ---------------------------------------------------------------------------
-- role_page_permissions (fix overly permissive admin policy)
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can read role_page_permissions" ON public.role_page_permissions;
CREATE POLICY "Authenticated users can read role_page_permissions"
  ON public.role_page_permissions FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin can manage role_page_permissions" ON public.role_page_permissions;
CREATE POLICY "Admin can manage role_page_permissions"
  ON public.role_page_permissions FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ---------------------------------------------------------------------------
-- order_number_sequences: RLS on, no client policies (trigger/service only)
-- ---------------------------------------------------------------------------
-- (intentionally no anon/authenticated policies)

-- ---------------------------------------------------------------------------
-- payouts / payout_items / payout_settings
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS "Merchants can view own payouts" ON public.payouts;
CREATE POLICY "Merchants can view own payouts"
  ON public.payouts FOR SELECT
  USING (public.owns_salon(salon_profile_id) OR user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Admin full access on payouts" ON public.payouts;
CREATE POLICY "Admin full access on payouts"
  ON public.payouts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Merchants can view own payout items" ON public.payout_items;
CREATE POLICY "Merchants can view own payout items"
  ON public.payout_items FOR SELECT
  USING (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.payouts p
      WHERE p.id = payout_items.payout_id
        AND (public.owns_salon(p.salon_profile_id) OR p.user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Admin full access on payout items" ON public.payout_items;
CREATE POLICY "Admin full access on payout items"
  ON public.payout_items FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Merchants can manage own payout settings" ON public.payout_settings;
CREATE POLICY "Merchants can manage own payout settings"
  ON public.payout_settings FOR ALL
  USING (public.owns_salon(salon_profile_id) OR public.is_admin())
  WITH CHECK (public.owns_salon(salon_profile_id) OR public.is_admin());

DROP POLICY IF EXISTS "Admin full access on payout settings" ON public.payout_settings;
CREATE POLICY "Admin full access on payout settings"
  ON public.payout_settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Harden sensitive SECURITY DEFINER RPCs (optional revoke from anon)
REVOKE EXECUTE ON FUNCTION public.cleanup_old_unstarred_versions() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.populate_order_items_on_paid() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.decrement_treatment_stock(uuid, integer) FROM anon;
REVOKE EXECUTE ON FUNCTION public.generate_salon_qr_secret(uuid) FROM anon;
