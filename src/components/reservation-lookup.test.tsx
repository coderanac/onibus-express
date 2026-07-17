import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQueryClient } from "@/test/render-with-query-client";
import { api } from "@/lib/api-client";
import type { ReservationWithTripDto } from "@/lib/types";
import { ReservationLookup } from "./reservation-lookup";

jest.mock("@/lib/api-client", () => ({
  api: {
    getReservationByCode: jest.fn(),
    cancelReservation: jest.fn(),
  },
}));

const reservation: ReservationWithTripDto = {
  id: "reservation-1",
  code: "ABC-12345",
  tripId: "trip-1",
  seatNumber: 5,
  passengerName: "Maria Silva",
  passengerCpf: "52998224725",
  passengerEmail: "maria@example.com",
  status: "CONFIRMED",
  createdAt: new Date().toISOString(),
  cancelledAt: null,
  trip: {
    id: "trip-1",
    routeId: "route-1",
    departureAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
    basePrice: 200,
    totalSeats: 40,
    route: {
      id: "route-1",
      origin: "São Paulo",
      destination: "Rio de Janeiro",
      durationMinutes: 360,
    },
  },
};

describe("ReservationLookup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("displays reservation details after searching by code", async () => {
    const user = userEvent.setup();
    (api.getReservationByCode as jest.Mock).mockResolvedValue(reservation);

    renderWithQueryClient(<ReservationLookup />);

    await user.type(screen.getByLabelText("Código da reserva"), "abc-12345");
    await user.click(screen.getByRole("button", { name: "Buscar" }));

    expect(await screen.findByText("Maria Silva")).toBeInTheDocument();
    expect(api.getReservationByCode).toHaveBeenCalledWith("ABC-12345");
  });

  it("cancels a confirmed reservation and reflects the new status", async () => {
    const user = userEvent.setup();
    let currentReservation = reservation;
    (api.getReservationByCode as jest.Mock).mockImplementation(() =>
      Promise.resolve(currentReservation),
    );
    (api.cancelReservation as jest.Mock).mockImplementation(() => {
      currentReservation = { ...currentReservation, status: "CANCELLED" };
      return Promise.resolve(currentReservation);
    });

    renderWithQueryClient(<ReservationLookup initialCode="ABC-12345" />);

    await screen.findByText("Maria Silva");
    await user.click(screen.getByRole("button", { name: "Cancelar reserva" }));

    expect(api.cancelReservation).not.toHaveBeenCalled();
    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Sim, cancelar" }));

    await waitFor(() => expect(api.cancelReservation).toHaveBeenCalledWith("ABC-12345"));
    expect(await screen.findByText("Cancelada")).toBeInTheDocument();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });

  it("keeps the reservation confirmed when the cancellation dialog is dismissed", async () => {
    const user = userEvent.setup();
    (api.getReservationByCode as jest.Mock).mockResolvedValue(reservation);

    renderWithQueryClient(<ReservationLookup initialCode="ABC-12345" />);

    await screen.findByText("Maria Silva");
    await user.click(screen.getByRole("button", { name: "Cancelar reserva" }));

    const dialog = await screen.findByRole("alertdialog");
    await user.click(within(dialog).getByRole("button", { name: "Voltar" }));

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(api.cancelReservation).not.toHaveBeenCalled();
    expect(screen.getByText("Confirmada")).toBeInTheDocument();
  });
});
