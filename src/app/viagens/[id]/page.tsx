import { TripSeatSelection } from "@/components/trip-seat-selection";

export default async function TripSeatSelectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <TripSeatSelection tripId={id} />;
}
