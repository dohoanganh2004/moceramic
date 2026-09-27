INSERT INTO permissions (code, description) VALUES ('inventory', 'Inventory');

-- admin (role_id 2) and warehouse_staff (role_id 4) manage stock levels.
INSERT INTO role_permissions (role_id, permission_id)
SELECT 2, id FROM permissions WHERE code = 'inventory';

INSERT INTO role_permissions (role_id, permission_id)
SELECT 4, id FROM permissions WHERE code = 'inventory';
