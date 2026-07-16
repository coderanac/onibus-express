interface SeatMapProps {
  totalSeats: number;
  occupiedSeats: number[];
  selectedSeat: number | null;
  onSelectSeat: (seatNumber: number) => void;
}

const SEATS_PER_ROW = 4;

function buildRows(totalSeats: number): number[][] {
  const rowCount = Math.ceil(totalSeats / SEATS_PER_ROW);

  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const firstSeat = rowIndex * SEATS_PER_ROW + 1;
    const seatsInRow = Math.min(SEATS_PER_ROW, totalSeats - rowIndex * SEATS_PER_ROW);
    return Array.from({ length: seatsInRow }, (_, seatIndex) => firstSeat + seatIndex);
  });
}

function seatClassName(isOccupied: boolean, isSelected: boolean): string {
  if (isOccupied) {
    return "flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-slate-200 text-sm font-semibold text-slate-400 shadow-inner cursor-not-allowed";
  }
  if (isSelected) {
    return "flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-violet-600 bg-violet-600 text-sm font-semibold text-white shadow-sm";
  }
  return "flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-violet-300 bg-white text-sm font-semibold text-violet-600 shadow-sm hover:border-violet-500";
}

export function SeatMap({
  totalSeats,
  occupiedSeats,
  selectedSeat,
  onSelectSeat,
}: SeatMapProps) {
  const rows = buildRows(totalSeats);

  function renderSeat(seatNumber: number) {
    const isOccupied = occupiedSeats.includes(seatNumber);
    const isSelected = seatNumber === selectedSeat;
    const seatState = isOccupied ? "ocupado" : isSelected ? "selecionado" : "livre";

    return (
      <button
        key={seatNumber}
        type="button"
        disabled={isOccupied}
        aria-pressed={isSelected}
        aria-label={`Assento ${seatNumber}, ${seatState}`}
        onClick={() => onSelectSeat(seatNumber)}
        className={seatClassName(isOccupied, isSelected)}
      >
        {isOccupied ? "X" : seatNumber}
      </button>
    );
  }

  return (
    <div>
      <div className="mb-6 flex justify-center gap-6 text-sm text-slate-600">
        <Legend colorClassName="border-2 border-violet-300 bg-white" label="Livre" />
        <Legend colorClassName="border border-slate-300 bg-slate-200" label="Ocupado" />
        <Legend colorClassName="bg-violet-600" label="Selecionado" />
      </div>

      <div className="mx-auto w-fit rounded-[2.5rem] border-2 border-slate-200 bg-slate-50 px-6 py-6">
        <div className="mb-6 flex justify-center">
          <SteeringWheelIcon />
        </div>

        <div className="flex flex-col gap-3">
          {rows.map((rowSeats, rowIndex) => {
            const isBackRow = rowIndex === rows.length - 1 && rowSeats.length === SEATS_PER_ROW;

            if (isBackRow) {
              return (
                <div key={rowSeats[0]} className="flex justify-center gap-3">
                  {rowSeats.map(renderSeat)}
                </div>
              );
            }

            const leftSeats = rowSeats.slice(0, 2);
            const rightSeats = rowSeats.slice(2, 4);

            return (
              <div key={rowSeats[0]} className="flex justify-center gap-6">
                <div className="flex gap-3">{leftSeats.map(renderSeat)}</div>
                {rightSeats.length > 0 ? (
                  <div className="flex gap-3">{rightSeats.map(renderSeat)}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Legend({ colorClassName, label }: { colorClassName: string; label: string }) {
  return (
    <span className="flex items-center gap-2">
      <span className={`h-4 w-4 rounded ${colorClassName}`} />
      {label}
    </span>
  );
}

function SteeringWheelIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="none"
      role="img"
      aria-label="Frente do veículo"
      className="text-slate-400"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="2.5" fill="currentColor" />
      <path
        d="M12 3.5v6M12 14.5v6M3.5 12h6M14.5 12h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
