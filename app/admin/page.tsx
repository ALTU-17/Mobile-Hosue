import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { site } from "@/lib/catalog";
import { AdminApp } from "@/components/admin/AdminApp";
import { hasAdminSession } from "@/lib/admin-auth";

export const metadata: Metadata = { title: "Content admin" };

export default async function AdminPage() {
  if (!(await hasAdminSession())) redirect("/admin/login");

  return <AdminApp initial={site} />;
}
