// Which "permissions" JWT claim code (see backend PermissionGuard / Sidebar.js
// STAFF_NAV_ITEMS) a staff/admin user needs to view a given /admin/* section.
// Matched by pathname prefix, so nested routes like /admin/orders/edit/5 or
// /admin/products/new inherit their parent section's requirement.
const ADMIN_ROUTE_PERMISSIONS = [
  { prefix: "/admin/dashboard", code: "dashboard" },
  { prefix: "/admin/orders", code: "orders" },
  { prefix: "/admin/shipments", code: "shipments" },
  { prefix: "/admin/custom-orders", code: "custom_orders" },
  { prefix: "/admin/payments", code: "payments" },
  { prefix: "/admin/vouchers", code: "vouchers" },
  { prefix: "/admin/inventory", code: "inventory" },
  { prefix: "/admin/products", code: "products" },
  { prefix: "/admin/categories", code: "categories" },
  { prefix: "/admin/blogs", code: "blog" },
  { prefix: "/admin/static-pages", code: "static_pages" },
  { prefix: "/admin/contact-messages", code: "contact_messages" },
  { prefix: "/admin/newsletter", code: "newsletter" },
  { prefix: "/admin/feedback", code: "feedback" },
  { prefix: "/admin/users", code: "users" },
];

// /admin/* paths any authenticated user may reach regardless of permissions -
// self-service pages that just happen to live under the /admin prefix, and
// static template documentation with no real data behind it.
const ADMIN_ROUTE_EXEMPTIONS = ["/admin/password", "/admin/documentation"];

export function canAccessAdminRoute(pathname, currentUser) {
  if (!pathname.startsWith("/admin")) return true;
  if (ADMIN_ROUTE_EXEMPTIONS.some((p) => pathname.startsWith(p))) return true;
  if (!currentUser) return false;
  if (currentUser.role === "admin") return true;
  // /admin/permissions is admin-only - there's no permission code that grants it.
  const match = ADMIN_ROUTE_PERMISSIONS.find((r) => pathname.startsWith(r.prefix));
  if (!match) return false;
  return (currentUser.permissions || []).includes(match.code);
}

export default ADMIN_ROUTE_PERMISSIONS;
