"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { getCityImage } from "@/lib/city-images";
import { splitCurrencyParts } from "@/lib/format";
import { useRoutes, useTripSearch } from "@/lib/queries";

interface Offer {
  routeId: string;
  origin: string;
  destination: string;
  lowestPrice: number;
}

function useOffers(): Offer[] {
  const { data: routes = [] } = useRoutes();
  const { data: trips = [] } = useTripSearch({}, true);

  return useMemo(() => {
    const lowestPriceByRoute = new Map<string, number>();
    for (const trip of trips) {
      const current = lowestPriceByRoute.get(trip.routeId);
      if (current === undefined || trip.basePrice < current) {
        lowestPriceByRoute.set(trip.routeId, trip.basePrice);
      }
    }

    return routes
      .filter((route) => lowestPriceByRoute.has(route.id))
      .map((route) => ({
        routeId: route.id,
        origin: route.origin,
        destination: route.destination,
        lowestPrice: lowestPriceByRoute.get(route.id) as number,
      }))
      .sort((a, b) => a.lowestPrice - b.lowestPrice);
  }, [routes, trips]);
}

function BusBadge() {
  return (
    <span className="absolute left-2 top-2 flex items-center gap-1 rounded-md bg-yellow-400 px-2 py-1 text-[11px] font-extrabold uppercase leading-none text-slate-900 shadow">
      🚌 Oferta
    </span>
  );
}

interface OfferCardProps {
  offer: Offer;
  onSelect: (origin: string, destination: string) => void;
}

function OfferCard({ offer, onSelect }: OfferCardProps) {
  const { reais, centavos } = splitCurrencyParts(offer.lowestPrice);

  return (
    <button
      type="button"
      onClick={() => onSelect(offer.origin, offer.destination)}
      className="flex w-64 shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:shadow-md sm:w-72"
    >
      <div className="relative h-32 w-full">
        <Image
          src={getCityImage(offer.destination)}
          alt={offer.destination}
          fill
          className="object-cover"
          sizes="288px"
        />
        <BusBadge />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <p className="text-sm font-semibold text-slate-900">
          Viaje de {offer.origin} para {offer.destination}
        </p>
        <div>
          <p className="text-xs text-slate-500">por apenas</p>
          <p className="leading-none text-slate-900">
            <span className="text-2xl font-extrabold">R$ {reais}</span>
            <span className="text-sm font-bold align-top">,{centavos}</span>
          </p>
        </div>
      </div>
    </button>
  );
}

interface OffersCarouselProps {
  onSelectOffer: (origin: string, destination: string) => void;
}

export function OffersCarousel({ onSelectOffer }: OffersCarouselProps) {
  const offers = useOffers();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activePage, setActivePage] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const cardWidth = 288;
  const pageCount = Math.max(1, offers.length - 3);

  function scrollByCards(amount: number) {
    const container = scrollRef.current;
    if (!container) return;
    container.scrollBy({ left: amount, behavior: "smooth" });
  }

  function handleScroll() {
    const container = scrollRef.current;
    if (!container) return;
    const index = Math.round(container.scrollLeft / cardWidth);
    setActivePage(Math.min(index, pageCount - 1));
    setCanScrollLeft(container.scrollLeft > 8);
    setCanScrollRight(
      container.scrollLeft + container.clientWidth < container.scrollWidth - 8,
    );
  }

  useEffect(() => {
    handleScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offers.length]);

  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="mt-12">
      <h2 className="text-xl font-bold text-slate-900">Passagens de ônibus em oferta</h2>

      <div className="relative mt-5">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-1"
        >
          {offers.map((offer) => (
            <OfferCard key={offer.routeId} offer={offer} onSelect={onSelectOffer} />
          ))}
        </div>

        {offers.length > 3 && canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByCards(-cardWidth * 2)}
            aria-label="Ver ofertas anteriores"
            className="absolute left-0 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white p-2 text-slate-700 shadow-md hover:bg-slate-50 sm:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        )}

        {offers.length > 3 && canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByCards(cardWidth * 2)}
            aria-label="Ver mais ofertas"
            className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-white p-2 text-slate-700 shadow-md hover:bg-slate-50 sm:flex"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              className="h-5 w-5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      {offers.length > 3 && (
        <div className="mt-4 flex items-center justify-center gap-1.5">
          {Array.from({ length: pageCount }).map((_, index) => (
            <span
              key={index}
              className={`h-1.5 rounded-full transition-all ${
                index === activePage ? "w-6 bg-primary-700" : "w-1.5 bg-slate-300"
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
