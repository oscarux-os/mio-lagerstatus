"use client";

import { useMemo, useState } from "react";
import { getStoreList, type StoreInfo, type StoreListItem } from "@/lib/lagerstatus";
import { ClockIcon, StoreIcon, TruckIcon } from "./status-card";

function StatusDot({ tone }: { tone: StoreListItem["status"]["tone"] }) {
  if (tone === "neutral") {
    return (
      <span className="shrink-0" style={{ color: "var(--success)" }}>
        <ClockIcon size={16} />
      </span>
    );
  }
  const color =
    tone === "green" ? "var(--success)" : tone === "amber" ? "#b8860b" : "var(--dot-muted)";
  return (
    <span className="flex items-center justify-center shrink-0 w-4 h-4">
      <span className="size-2.5 rounded-full" style={{ background: color }} />
    </span>
  );
}

function StoreRow({
  item,
  selected,
  onSelect,
}: {
  item: StoreListItem;
  selected: boolean;
  onSelect: () => void;
}) {
  const { store, status, pickup, homeDelivery } = item;
  return (
    <div
      className={`w-full p-4 flex items-start justify-between gap-3 transition-colors ${
        selected ? "bg-[#f4f0e8]" : "bg-white"
      }`}
    >
      <div className="flex flex-col gap-2 min-w-0">
        <span className="text-base leading-6 font-medium truncate" style={{ color: "var(--text)" }}>
          {store.name}
        </span>

        <div className="flex items-center gap-1.5">
          <StatusDot tone={status.tone} />
          <span className="text-sm" style={{ color: "var(--text)" }}>
            {status.sublabel ? `${status.label} · ${status.sublabel}` : status.label}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <StoreIcon />
            <span>{pickup}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm" style={{ color: "var(--muted-foreground)" }}>
            <TruckIcon />
            <span>{homeDelivery}</span>
          </div>
        </div>
      </div>

      <button
        onClick={onSelect}
        disabled={selected}
        className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          selected
            ? "bg-[var(--success)] text-white cursor-default"
            : "border border-[var(--border-subtle)] text-[var(--text)] hover:bg-[#faf8f3]"
        }`}
      >
        {selected ? "Vald" : "Välj"}
      </button>
    </div>
  );
}

export function StoreSelectorPanel({
  open,
  selectedStoreId,
  onClose,
  onSelect,
}: {
  open: boolean;
  selectedStoreId?: string;
  onClose: () => void;
  onSelect: (store: StoreInfo) => void;
}) {
  const [query, setQuery] = useState("");
  const items = useMemo(() => getStoreList(), []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? items.filter((it) => it.store.name.toLowerCase().includes(q)) : items;
  }, [items, query]);

  if (!open) return null;

  const inStockCount = items.filter((it) => it.store.state === "i_lager").length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      <div className="relative h-full w-full max-w-md bg-[var(--background)] flex flex-col shadow-xl">
        <header className="shrink-0 p-5 border-b border-[var(--border-subtle)] bg-white">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium" style={{ color: "var(--text)" }}>
                Välj butik
              </h2>
              <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                Finns i lager i {inStockCount} av {items.length} butiker
              </p>
            </div>
            <button
              onClick={onClose}
              aria-label="Stäng"
              className="shrink-0 -mr-1 -mt-1 p-1 text-[var(--muted-foreground)] hover:text-[var(--text)]"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Sök butik eller ort"
            className="field mt-4"
          />
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="flex flex-col gap-px bg-[var(--border-subtle)]">
            {filtered.map((item) => (
              <StoreRow
                key={item.store.id}
                item={item}
                selected={item.store.id === selectedStoreId}
                onSelect={() => {
                  onSelect(item.store);
                  onClose();
                }}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="p-6 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
              Inga butiker matchar ”{query}”.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
