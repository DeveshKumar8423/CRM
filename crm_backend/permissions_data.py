"""Level 1 permission definitions and default role mappings."""

PERMISSIONS = [
    # Profile (all staff + public user)
    ("profile.view", "View own profile", "profile"),
    ("profile.edit", "Edit own profile", "profile"),
    ("profile.change_password", "Change own password", "profile"),
    # Company
    ("company.view", "View company settings", "company"),
    ("company.edit", "Edit company settings", "company"),
    # User management
    ("users.view", "View staff users", "users"),
    ("users.create", "Create staff users", "users"),
    ("users.edit", "Edit staff users", "users"),
    ("users.reset_password", "Reset staff passwords", "users"),
    ("activity.view", "View activity logs", "users"),
    # Roles & permissions
    ("roles.view", "View role permission matrix", "roles"),
    # Reserved for upcoming Level 1 modules
    ("contacts.view", "View contacts", "contacts"),
    ("contacts.create", "Create contacts", "contacts"),
    ("contacts.edit", "Edit contacts", "contacts"),
    ("products.view", "View products", "products"),
    ("products.create", "Create products", "products"),
    ("products.edit", "Edit products", "products"),
    ("settings.view", "View system settings", "settings"),
    ("settings.edit", "Edit system settings", "settings"),
]

ROLE_PERMISSIONS: dict[str, list[str]] = {
    "Admin": [code for code, _, _ in PERMISSIONS],
    "Manager": [
        "profile.view",
        "profile.edit",
        "profile.change_password",
        "contacts.view",
        "contacts.create",
        "contacts.edit",
        "products.view",
    ],
    "Employee": [
        "profile.view",
        "profile.edit",
        "profile.change_password",
        "contacts.view",
        "products.view",
    ],
    "User": [
        "profile.view",
        "profile.edit",
        "profile.change_password",
    ],
}
