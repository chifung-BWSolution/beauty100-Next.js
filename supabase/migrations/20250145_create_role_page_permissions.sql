CREATE TABLE IF NOT EXISTS role_page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  page_path TEXT NOT NULL,
  page_label TEXT NOT NULL,
  allowed BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role, page_path)
);

INSERT INTO role_page_permissions (role, page_path, page_label, allowed) VALUES
  ('admin', '/admin/dashboard', '申請管理', true),
  ('admin', '/admin/enquiries', '表單查詢', true),
  ('admin', '/admin/salons', '所有美容院', true),
  ('admin', '/admin/articles', '文章管理', true),
  ('admin', '/admin/users', '用戶管理', true),
  ('admin', '/admin/staff', 'Staff 管理', true),
  ('admin', '/admin/logs', '用戶日誌', true),
  ('admin', '/admin/settings', '系統設定', true),
  ('marketing', '/admin/dashboard', '申請管理', true),
  ('marketing', '/admin/enquiries', '表單查詢', true),
  ('marketing', '/admin/salons', '所有美容院', true),
  ('marketing', '/admin/articles', '文章管理', true),
  ('marketing', '/admin/users', '用戶管理', false),
  ('marketing', '/admin/staff', 'Staff 管理', false),
  ('marketing', '/admin/logs', '用戶日誌', false),
  ('marketing', '/admin/settings', '系統設定', false)
ON CONFLICT (role, page_path) DO NOTHING;
