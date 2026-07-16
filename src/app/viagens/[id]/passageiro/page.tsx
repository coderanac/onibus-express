import { PassengerCheckout } from "@/components/passenger-checkout";

export default async function PassengerCheckoutPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ assento?: string }>;
}) {
  const { id } = await params;
  const { assento } = await searchParams;

  return <PassengerCheckout tripId={id} seatNumber={Number(assento)} />;
}
