INSERT INTO role_page_permissions (role, page_path, page_label, allowed) VALUES
  ('admin', '/admin/images', '圖片庫', true),
  ('marketing', '/admin/images', '圖片庫', true)
ON CONFLICT (role, page_path) DO UPDATE SET allowed = true, updated_at = NOW();
