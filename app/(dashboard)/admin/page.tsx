import { AdminDashboardView } from "@/components/admin-dashboard-view";

export default function AdminPage(props: PageProps<"/admin">) {
  return <AdminDashboardView {...props} />;
}
