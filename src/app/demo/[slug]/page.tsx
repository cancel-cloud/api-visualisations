import { redirect } from "next/navigation";

import { resolveLegacyDemoPath } from "@/lib/library-config/legacy-map";

type LegacyDemoRedirectPageProps = {
  params: Promise<{ slug: string }>;
};

export default async function LegacyDemoRedirectPage({ params }: LegacyDemoRedirectPageProps) {
  const { slug } = await params;
  redirect(resolveLegacyDemoPath(slug));
}
