package com.example.moceramicshop.security;

import com.example.moceramicshop.exceptions.ForbiddenException;
import com.example.moceramicshop.services.PermissionService;
import org.springframework.stereotype.Component;

// Re-checks the caller's role against role_permissions on every call (never
// trusts the `permissions` claim baked into their JWT, which can be up to 15
// minutes stale) so a permission change made in /admin/permissions takes
// effect on the very next request. "admin" always bypasses the DB lookup so
// the role that manages permissions can never lock itself out of a module
// nobody has explicitly granted it yet (e.g. a permission created after the
// admin's row was last saved).
@Component
public class PermissionGuard {

    private final PermissionService permissionService;

    public PermissionGuard(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    public void require(CustomUserDetails currentUser, String code) {
        if (currentUser == null) {
            throw new ForbiddenException("Bạn cần đăng nhập để thực hiện thao tác này");
        }
        if ("admin".equals(currentUser.getUser().getRole().getName())) {
            return;
        }
        Integer roleId = currentUser.getUser().getRole().getId();
        if (!permissionService.hasPermission(roleId, code)) {
            throw new ForbiddenException("Bạn không có quyền thực hiện thao tác này");
        }
    }
}
