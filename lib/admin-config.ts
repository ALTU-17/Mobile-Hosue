/**
 * Admin password gate.
 *
 * Set to `true` to require ADMIN_PASSWORD again: /admin then redirects to
 * /admin/login without a signed session, and the panel shows a Sign out button.
 * With `false`, /admin opens straight into the editor and /admin/login bounces
 * back to /admin. The auth code itself is untouched either way.
 *
 * Kept in its own module because it is read by both server pages and the
 * client panel; lib/admin-auth.ts imports next/headers and cannot be bundled
 * into a client component.
 */
export const adminAuthEnabled = false;
