"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { Button } from "@/components/ui/button";
import { DateInput, type DateInputHandle } from "@/components/ui/date-input";
import { parseBrDateToIso } from "@/domain/date";
import type { TripSearchFiltersInput } from "@/lib/types";

export interface SearchFormPrefill {
  origin: string;
  destination: string;
  token: number;
}

export interface SearchFormHandle {
  openDatePicker: () => void;
}

interface SearchFormProps {
  onSearch: (filters: TripSearchFiltersInput) => void;
  isLoading?: boolean;
  prefill?: SearchFormPrefill | null;
}

export const SearchForm = forwardRef<SearchFormHandle, SearchFormProps>(
  function SearchForm({ onSearch, isLoading = false, prefill }, ref) {
    const [origin, setOrigin] = useState("");
    const [destination, setDestination] = useState("");
    const [date, setDate] = useState("");
    const dateInputRef = useRef<DateInputHandle>(null);

    useEffect(() => {
      if (!prefill) return;
      setOrigin(prefill.origin);
      setDestination(prefill.destination);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [prefill?.token]);

    useImperativeHandle(ref, () => ({
      openDatePicker: () => dateInputRef.current?.openPicker(),
    }));

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
      event.preventDefault();
      onSearch({
        origin: origin.trim(),
        destination: destination.trim(),
        date: parseBrDateToIso(date) ?? undefined,
      });
    }

    return (
      <form
        onSubmit={handleSubmit}
        aria-label="Buscar passagens"
        className="grid gap-4 sm:grid-cols-4"
      >
        <div>
          <label htmlFor="origin" className="block text-sm font-medium text-slate-700">
            Origem
          </label>
          <input
            id="origin"
            required
            value={origin}
            onChange={(event) => setOrigin(event.target.value)}
            placeholder="São Paulo"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="destination"
            className="block text-sm font-medium text-slate-700"
          >
            Destino
          </label>
          <input
            id="destination"
            required
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="Rio de Janeiro"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-slate-700">
            Data de ida
          </label>
          <DateInput
            id="date"
            ref={dateInputRef}
            value={date}
            onChange={setDate}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-600 focus:outline-none"
          />
        </div>
        <div className="flex items-end">
          <Button type="submit" isLoading={isLoading} className="w-full">
            Buscar
          </Button>
        </div>
      </form>
    );
  },
);
