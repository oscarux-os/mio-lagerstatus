import { type BoxContent, type BoxRow } from "@/lib/lagerstatus";

export function ClockIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

export function StoreIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9Z" />
      <path d="M9 21v-9h6v9" />
    </svg>
  );
}

export function TruckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v4h-7V8Z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

export function PackageIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="M3.3 7 12 12l8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}

function iconForSlot(slot: "store" | "truck" | "package") {
  if (slot === "store") return <StoreIcon />;
  if (slot === "package") return <PackageIcon />;
  return <TruckIcon />;
}

function StockRow({ row, onAction }: { row: Extract<BoxRow, { kind: "stock" }>; onAction?: () => void }) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      <div className="flex items-center shrink-0 w-4 h-5">
        <span
          className="rounded-full size-2.5"
          style={{ background: row.tone === "positive" ? "var(--success)" : "var(--dot-muted)" }}
        />
      </div>
      <p
        className="flex-1 min-w-0 text-base leading-6 tracking-[-0.2px]"
        style={{ color: row.tone === "positive" ? "var(--text)" : "var(--muted-foreground)" }}
      >
        {row.text}
      </p>
      {row.action && (
        <button onClick={onAction} className="shrink-0 text-base leading-6 tracking-[-0.2px] underline underline-offset-2 whitespace-nowrap" style={{ color: "var(--text)" }}>
          {row.action}
        </button>
      )}
    </div>
  );
}

function EtaRow({ row, onAction }: { row: Extract<BoxRow, { kind: "eta" }>; onAction?: () => void }) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="shrink-0" style={{ color: "var(--success)" }}>
        <ClockIcon />
      </span>
      <p className="flex-1 min-w-0 text-base leading-6 tracking-[-0.2px]" style={{ color: "var(--text)" }}>
        {row.text}
      </p>
      {row.action && (
        <button onClick={onAction} className="shrink-0 text-base leading-6 tracking-[-0.2px] underline underline-offset-2 whitespace-nowrap" style={{ color: "var(--text)" }}>
          {row.action}
        </button>
      )}
    </div>
  );
}

function DeliveryRow({ row, onAction }: { row: Extract<BoxRow, { kind: "delivery" }>; onAction?: () => void }) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="shrink-0" style={{ color: "var(--muted-foreground)" }}>{iconForSlot(row.icon)}</span>
      <p className={`flex-1 min-w-0 text-sm leading-5 tracking-[-0.05px] ${row.action ? "" : "whitespace-nowrap"}`} style={{ color: "var(--text)" }}>
        {row.text}
        {row.action && (
          <>
            {", "}
            <button onClick={onAction} className="underline underline-offset-2" style={{ color: "var(--text)" }}>
              {row.action}
            </button>
          </>
        )}
      </p>
      {row.price && (
        <p className="shrink-0 text-sm leading-5 tracking-[-0.05px] whitespace-nowrap" style={{ color: "var(--text)" }}>
          {row.price}
        </p>
      )}
    </div>
  );
}

function MessageRow({ row, onAction }: { row: Extract<BoxRow, { kind: "message" }>; onAction?: () => void }) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      <span className="shrink-0" style={{ color: "var(--muted-foreground)" }}>{iconForSlot(row.icon)}</span>
      <p className="flex-1 min-w-0 text-sm leading-5 tracking-[-0.05px]" style={{ color: "var(--text)" }}>
        {row.action && (
          <>
            <button onClick={onAction} className="underline underline-offset-2" style={{ color: "var(--text)" }}>
              {row.action}
            </button>
            {" "}
          </>
        )}
        {row.text}
      </p>
    </div>
  );
}

function BoxRowView({ row, onAction }: { row: BoxRow; onAction?: () => void }) {
  if (row.kind === "stock")    return <StockRow row={row} onAction={onAction} />;
  if (row.kind === "eta")      return <EtaRow row={row} onAction={onAction} />;
  if (row.kind === "delivery") return <DeliveryRow row={row} onAction={onAction} />;
  return <MessageRow row={row} onAction={onAction} />;
}

type CardPosition = "first" | "last" | "only";

function borderClass(position: CardPosition) {
  if (position === "first") return "border-t border-l border-r border-[var(--border-subtle)]";
  if (position === "last")  return "border-b border-l border-r border-[var(--border-subtle)]";
  return "border border-[var(--border-subtle)]";
}

export function StatusCard({ content, position = "only", onAction }: { content: BoxContent; position?: CardPosition; onAction?: () => void }) {
  const stockRows: BoxRow[] = [];
  const deliveryRows: BoxRow[] = [];
  for (const row of content.rows) {
    if (row.kind === "stock" || row.kind === "eta") stockRows.push(row);
    else deliveryRows.push(row);
  }

  return (
    <section className={`bg-white w-full p-4 flex flex-col gap-3 ${borderClass(position)}`}>
      {stockRows.map((row, i) => <BoxRowView key={i} row={row} onAction={onAction} />)}
      {deliveryRows.length > 0 && (
        <div className="flex flex-col gap-1">
          {deliveryRows.map((row, i) => <BoxRowView key={i} row={row} onAction={onAction} />)}
        </div>
      )}
      {content.footerLink && (
        <button onClick={onAction} className="text-sm leading-5 tracking-[-0.05px] underline underline-offset-2 text-left" style={{ color: "var(--text)" }}>
          {content.footerLink}
        </button>
      )}
    </section>
  );
}

export function LagerstatusBoxes({
  storeContent,
  onlineContent,
  onStoreAction,
}: {
  storeContent: BoxContent | null;
  onlineContent: BoxContent | null;
  onStoreAction?: () => void;
}) {
  const both = Boolean(storeContent && onlineContent);
  return (
    <div className="flex flex-col gap-px w-full bg-[var(--border-subtle)]">
      {onlineContent && <StatusCard content={onlineContent} position={both ? "first" : "only"} onAction={onStoreAction} />}
      {storeContent && <StatusCard content={storeContent} position={both ? "last" : "only"} onAction={onStoreAction} />}
    </div>
  );
}
