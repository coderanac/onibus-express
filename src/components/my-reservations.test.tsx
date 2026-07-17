import { screen } from "@testing-library/react";
import { renderWithQueryClient } from "@/test/render-with-query-client";
import { api } from "@/lib/api-client";
import { MyReservations } from "./my-reservations";

jest.mock("@/lib/api-client", () => ({
  api: {
    getCurrentUser: jest.fn(),
    listMyReservations: jest.fn(),
  },
}));

const trip = {
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
};

describe("MyReservations", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("prompts the visitor to log in when there is no active session", async () => {
    (api.getCurrentUser as jest.Mock).mockResolvedValue({ user: null });

    renderWithQueryClient(<MyReservations />);

    expect(
      await screen.findByText("Entre com seu e-mail e senha para ver suas reservas."),
    ).toBeInTheDocument();
    expect(api.listMyReservations).not.toHaveBeenCalled();
  });

  it("lists the reservations belonging to the logged in user", async () => {
    (api.getCurrentUser as jest.Mock).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Maria Silva",
        cpf: "52998224725",
        email: "maria@example.com",
        birthDate: "1990-01-01T00:00:00.000Z",
        createdAt: new Date().toISOString(),
      },
    });
    (api.listMyReservations as jest.Mock).mockResolvedValue([
      {
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
        trip,
      },
    ]);

    renderWithQueryClient(<MyReservations />);

    expect(await screen.findByText("São Paulo → Rio de Janeiro")).toBeInTheDocument();
    expect(screen.getByText(/ABC-12345/)).toBeInTheDocument();
  });

  it("shows an empty state when the user has no reservations", async () => {
    (api.getCurrentUser as jest.Mock).mockResolvedValue({
      user: {
        id: "user-1",
        name: "Maria Silva",
        cpf: "52998224725",
        email: "maria@example.com",
        birthDate: "1990-01-01T00:00:00.000Z",
        createdAt: new Date().toISOString(),
      },
    });
    (api.listMyReservations as jest.Mock).mockResolvedValue([]);

    renderWithQueryClient(<MyReservations />);

    expect(
      await screen.findByText("Você ainda não fez nenhuma reserva com esta conta."),
    ).toBeInTheDocument();
  });
});
