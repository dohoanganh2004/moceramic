CREATE TABLE IF NOT EXISTS permissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(100) NOT NULL UNIQUE,
  description VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS role_permissions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
  UNIQUE KEY uk_role_permission (role_id, permission_id)
);

INSERT INTO permissions (code, description) VALUES
  ('dashboard', 'Dashboard'),
  ('orders', 'Orders'),
  ('shipments', 'Shipments'),
  ('custom_orders', 'Custom Orders'),
  ('payments', 'Payments'),
  ('vouchers', 'Vouchers'),
  ('products', 'Products'),
  ('categories', 'Categories'),
  ('blog', 'Blog'),
  ('static_pages', 'Static Pages'),
  ('contact_messages', 'Contact Messages'),
  ('newsletter', 'Newsletter'),
  ('users', 'Users'),
  ('feedback', 'Feedback');

-- admin (role_id 2): every permission
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions;

-- sales_staff (role_id 3): orders, custom_orders, vouchers, contact_messages, feedback
INSERT INTO role_permissions (role_id, permission_id)
SELECT 3, id FROM permissions WHERE code IN ('orders', 'custom_orders', 'vouchers', 'contact_messages', 'feedback');

-- warehouse_staff (role_id 4): orders, shipments, products
INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code IN ('orders', 'shipments', 'products');

-- accountant (role_id 5): orders, payments
INSERT INTO role_permissions (role_id, permission_id)
SELECT 5, id FROM permissions WHERE code IN ('orders', 'payments');

-- marketing (role_id 6): vouchers, products, categories, blog, static_pages, newsletter, feedback
INSERT INTO role_permissions (role_id, permission_id)
SELECT 6, id FROM permissions WHERE code IN ('vouchers', 'products', 'categories', 'blog', 'static_pages', 'newsletter', 'feedback');

-- dashboard: every authenticated staff role (all except customer, role_id 1)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r JOIN permissions p ON p.code = 'dashboard' WHERE r.id <> 1
  AND NOT EXISTS (SELECT 1 FROM role_permissions rp WHERE rp.role_id = r.id AND rp.permission_id = p.id);
