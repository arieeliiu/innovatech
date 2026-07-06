'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ProjectMembersPage() {
  const params = useParams();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/projects/${params.id}#members-section`);
  }, [params.id, router]);

  return (
    <section className="mx-auto w-full max-w-[1240px]">
      <p className="text-content-muted">Abriendo miembros del proyecto...</p>
    </section>
  );
}
