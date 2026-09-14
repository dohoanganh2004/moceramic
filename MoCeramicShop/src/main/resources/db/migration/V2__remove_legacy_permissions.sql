-- The permissions table pre-existed with a finer-grained, never-wired-up set
-- of codes (product.view, order.view, user.manage, ...) left over from the
-- original template scaffold. Nothing in the codebase referenced them. Remove
-- them so the permissions/role_permissions tables contain only the module-level
-- codes this feature actually uses.
DELETE FROM role_permissions
WHERE permission_id IN (
  SELECT id FROM permissions WHERE code NOT IN (
    'dashboard', 'orders', 'shipments', 'custom_orders', 'payments', 'vouchers',
    'products', 'categories', 'blog', 'static_pages', 'contact_messages',
    'newsletter', 'users', 'feedback'
  )
);

DELETE FROM permissions WHERE code NOT IN (
  'dashboard', 'orders', 'shipments', 'custom_orders', 'payments', 'vouchers',
  'products', 'categories', 'blog', 'static_pages', 'contact_messages',
  'newsletter', 'users', 'feedback'
);
