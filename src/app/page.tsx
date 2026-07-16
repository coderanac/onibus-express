"use client";

import { useRef, useState } from "react";
import { OffersCarousel } from "@/components/offers-carousel";
import { SearchForm, type SearchFormHandle, type SearchFormPrefill } from "@/components/search-form";
import { TripList } from "@/components/trip-list";
import { useTripSearch } from "@/lib/queries";
import type { TripSearchFiltersInput } from "@/lib/types";

export default function HomePage() {
  const [filters, setFilters] = useState<TripSearchFiltersInput | null>(null);
  const [prefill, setPrefill] = useState<SearchFormPrefill | null>(null);
  const searchFormRef = useRef<SearchFormHandle>(null);
  const { data: trips = [], isLoading } = useTripSearch(filters ?? {}, filters !== null);

  function handleSelectOffer(origin: string, destination: string) {
    setPrefill({ origin, destination, token: Date.now() });
    document.getElementById("busca")?.scrollIntoView({ behavior: "smooth" });
    searchFormRef.current?.openDatePicker();
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Para onde vamos?</h1>
      <p className="mt-1 text-slate-600">
        Encontre a melhor passagem de ônibus para a sua próxima viagem.
      </p>

      <div id="busca" className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <SearchForm
          ref={searchFormRef}
          onSearch={setFilters}
          isLoading={isLoading}
          prefill={prefill}
        />
      </div>

      <TripList trips={trips} isLoading={isLoading} hasSearched={filters !== null} />

      <OffersCarousel onSelectOffer={handleSelectOffer} />
    </div>
  );
}
