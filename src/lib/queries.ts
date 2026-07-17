import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type {
  CreateReservationInput,
  LoginInput,
  RegisterInput,
  ReservationWithTripDto,
  TripSearchFiltersInput,
  TripSeatMapDto,
} from "@/lib/types";

export const queryKeys = {
  routes: ["routes"] as const,
  trips: (filters: TripSearchFiltersInput) => ["trips", filters] as const,
  trip: (tripId: string) => ["trip", tripId] as const,
  reservation: (code: string) => ["reservation", code] as const,
  currentUser: ["currentUser"] as const,
  myReservations: ["myReservations"] as const,
};

export function useRoutes() {
  return useQuery({ queryKey: queryKeys.routes, queryFn: api.listRoutes });
}

export function useTripSearch(filters: TripSearchFiltersInput, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.trips(filters),
    queryFn: () => api.searchTrips(filters),
    enabled,
  });
}

export function useTripDetails(tripId: string) {
  return useQuery({
    queryKey: queryKeys.trip(tripId),
    queryFn: () => api.getTripDetails(tripId),
    enabled: Boolean(tripId),
  });
}

export function useReservationByCode(code: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.reservation(code),
    queryFn: () => api.getReservationByCode(code),
    enabled,
    retry: false,
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReservationInput) => api.createReservation(input),
    onMutate: async (input) => {
      const key = queryKeys.trip(input.tripId);
      await queryClient.cancelQueries({ queryKey: key });
      const previousTrip = queryClient.getQueryData<TripSeatMapDto>(key);

      if (previousTrip) {
        queryClient.setQueryData<TripSeatMapDto>(key, {
          ...previousTrip,
          occupiedSeats: [...previousTrip.occupiedSeats, input.seatNumber],
        });
      }

      return { previousTrip, key };
    },
    onError: (_error, _input, context) => {
      if (context?.previousTrip) {
        queryClient.setQueryData(context.key, context.previousTrip);
      }
    },
    onSettled: (_data, _error, input) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.trip(input.tripId) });
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.myReservations });
    },
  });
}

export function useCancelReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => api.cancelReservation(code),
    onMutate: async (code) => {
      const key = queryKeys.reservation(code);
      await queryClient.cancelQueries({ queryKey: key });
      const previousReservation = queryClient.getQueryData<ReservationWithTripDto>(key);

      if (previousReservation) {
        queryClient.setQueryData<ReservationWithTripDto>(key, {
          ...previousReservation,
          status: "CANCELLED",
        });
      }

      return { previousReservation, key };
    },
    onError: (_error, _code, context) => {
      if (context?.previousReservation) {
        queryClient.setQueryData(context.key, context.previousReservation);
      }
    },
    onSettled: (data, _error, code, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.reservation(code) });
      queryClient.invalidateQueries({ queryKey: queryKeys.myReservations });

      const tripId = data?.tripId ?? context?.previousReservation?.trip.id;
      if (tripId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.trip(tripId) });
      }
      queryClient.invalidateQueries({ queryKey: ["trips"] });
    },
  });
}

export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: api.getCurrentUser,
    select: (data) => data.user,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => api.login(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.currentUser, { user });
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => api.register(input),
    onSuccess: (user) => {
      queryClient.setQueryData(queryKeys.currentUser, { user });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.logout,
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.currentUser, { user: null });
      queryClient.invalidateQueries({ queryKey: queryKeys.myReservations });
    },
  });
}

export function useMyReservations(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.myReservations,
    queryFn: api.listMyReservations,
    enabled,
    retry: false,
  });
}
