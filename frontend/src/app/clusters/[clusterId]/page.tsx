import { ClusterDetailsPage } from "@/components/ClusterDetailsPage";

interface PageProps {
  params: Promise<{
    clusterId: string;
  }>;
}

export default async function Page({ params }: PageProps) {
  const { clusterId } = await params;

  return <ClusterDetailsPage clusterId={clusterId} />;
}
