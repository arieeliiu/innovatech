import { redirect } from 'next/navigation';

export default function LegacyAdminCreateProjectPage() {
  redirect('/admin/projects?create=1');
}
