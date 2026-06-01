INSERT INTO role_page_permissions (role, page_path, page_label, allowed) VALUES
  ('admin', '/admin/payouts', '結算管理', true)
ON CONFLICT (role, page_path) DO UPDATE SET allowed = true, updated_at = NOW();
