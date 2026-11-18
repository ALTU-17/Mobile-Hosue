import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { site } from "@/lib/catalog";
import { AdminApp } from "@/components/admin/AdminApp";
import { hasAdminSession } from "@/lib/admin-auth";
import { adminAuthEnabled } from "@/lib/admin-config";

export const metadata: Metadata = { title: "Content admin" };

export default async function AdminPage() {
  // Auth paused in lib/admin-config.ts; this line is inert until it is true.
  if (adminAuthEnabled && !(await hasAdminSession())) redirect("/admin/login");

  return <AdminApp initial={site} />;
}
