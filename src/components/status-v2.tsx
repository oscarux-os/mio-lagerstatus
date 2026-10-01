"use client";

import { useEffect, useRef, useState } from "react";
import {
  normalizePostcode,
  type V2Action,
  type V2DeliveryRow,
  type V2Result,
  type V2StoreRow,
  type V2Tone,
} from "@/lib/lagerstatus-v2";
import { ClockIcon } from "./status-card";

// v2-komponenten: två rader, inga priser, inga antal.
//
// Varje rad bär en prick (finns nu) eller en klocka (på ingång). Klockan ersätter den gula
// pricken helt – betydelsen sitter i formen i stället för i färgen, vilket är både snabbare
// att läsa och det enda som fungerar för den som inte skiljer gult från grönt.
//
// Inga leveranssätt-ikoner: med två rader vars text redan börjar med "I lager hos …" och
// "Levereras inom …" säger en butiks- respektive paketikon ingenting som texten inte redan
// sagt. Pricken är den enda markering som bär information texten inte har.
//
// Fraktpriser, "hämta gratis" och 60-minutersvillkoret ligger medvetet utanför komponenten.
// De gäller hela sortimentet och är därför USP-band och kassa, inte lagerstatus per produkt.

function toneColor(tone: V2Tone): string {
  if (tone === "ok") return "var(--text)";
  if (tone === "wait") return "var(--text)";
  return "var(--muted-foreground)";
}

function StatusMark({ tone }: { tone: V2Tone }) {
  if (tone === "wait") {
    return (
      <span className="shrink-0" style={{ color: "var(--success)" }}>
        <ClockIcon size={16} />
      </span>
    );
  }
  return (
    <span className="flex items-center justify-center shrink-0 w-4 h-4">
      <span
        className="rounded-full size-2.5"
        style={{ background: tone === "ok" ? "var(--success)" : "var(--dot-muted)" }}
      />
    </span>
  );
}

function ActionButton({ action, onAction }: { action: V2Action; onAction: (a: V2Action) => void }) {
  return (
    <button
      onClick={() => onAction(action)}
      className="shrink-0 text-base leading-6 tracking-[-0.2px] underline underline-offset-2 whitespace-nowrap"
      style={{ color: "var(--text)" }}
    >
      {action.label}
    </button>
  );
}

function PostcodeField({
  value,
  onCommit,
  onCancel,
}: {
  value: string | null;
  onCommit: (postcode: string) => void;
  onCancel: () => void;
}) {
  const [draft, setDraft] = useState(value ?? "");
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    inputRef.current?.select();
  }, []);

  function commit() {
    const normalized = normalizePostcode(draft);
    if (!normalized) {
      setError(true);
      return;
    }
    onCommit(normalized);
  }

  return (
    <div className="flex items-center gap-2 w-full">
      <span className="shrink-0 w-4" aria-hidden />
      <input
        ref={inputRef}
        value={draft}
        inputMode="numeric"
        maxLength={6}
        placeholder="169 70"
        onChange={(e) => {
          setDraft(e.target.value);
          setError(false);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") onCancel();
        }}
        className="w-28 border px-2.5 py-1.5 text-base leading-6 bg-white"
        style={{ borderColor: error ? "#b00020" : "var(--border-subtle)", color: "var(--text)" }}
        aria-label="Postnummer"
      />
      <button
        onClick={commit}
        className="px-3 py-1.5 text-base leading-6 text-white"
        style={{ background: "var(--success)" }}
      >
        Visa
      </button>
      <button
        onClick={onCancel}
        className="text-base leading-6 underline underline-offset-2"
        style={{ color: "var(--muted-foreground)" }}
      >
        Avbryt
      </button>
      {error && (
        <span className="text-sm" style={{ color: "#b00020" }}>
          Fem siffror
        </span>
      )}
    </div>
  );
}

function StoreRowView({ row, onAction }: { row: V2StoreRow; onAction: (a: V2Action) => void }) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      <StatusMark tone={row.tone} />
      <p
        className="flex-1 min-w-0 text-base leading-6 tracking-[-0.2px]"
        style={{ color: toneColor(row.tone) }}
      >
        {row.text}
      </p>
      {row.action && <ActionButton action={row.action} onAction={onAction} />}
    </div>
  );
}

function DeliveryRowView({ row, onAction }: { row: V2DeliveryRow; onAction: (a: V2Action) => void }) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      <StatusMark tone={row.tone} />
      <p
        className="flex-1 min-w-0 text-base leading-6 tracking-[-0.2px]"
        style={{ color: toneColor(row.tone) }}
      >
        {row.text}
        {row.strong && <strong className="font-semibold">{row.strong}</strong>}
      </p>
      {row.action && <ActionButton action={row.action} onAction={onAction} />}
    </div>
  );
}

export function StatusV2({
  result,
  postcode,
  onOpenStores,
  onSetPostcode,
}: {
  result: V2Result;
  postcode: string | null;
  onOpenStores: () => void;
  onSetPostcode: (postcode: string | null) => void;
}) {
  const [editingPostcode, setEditingPostcode] = useState(false);

  function handleAction(action: V2Action) {
    if (action.kind === "stores") onOpenStores();
    if (action.kind === "postcode") setEditingPostcode(true);
  }

  return (
    <section className="w-full">
      <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--text)" }}>
        Tillgänglighet
      </h2>
      <div
        className="bg-white w-full p-4 flex flex-col gap-3 border"
        style={{ borderColor: "var(--border-subtle)" }}
      >
      <StoreRowView row={result.store} onAction={handleAction} />
      {editingPostcode ? (
        <PostcodeField
          value={postcode}
          onCommit={(value) => {
            onSetPostcode(value);
            setEditingPostcode(false);
          }}
          onCancel={() => setEditingPostcode(false)}
        />
      ) : (
        <DeliveryRowView row={result.delivery} onAction={handleAction} />
      )}
      {result.footerLink && (
        <button
          onClick={() => handleAction(result.footerLink!)}
          className="self-start text-base leading-6 tracking-[-0.2px] underline underline-offset-2"
          style={{ color: "var(--text)" }}
        >
          {result.footerLink.label}
        </button>
      )}
      </div>
    </section>
  );
}

// Visas bara i prototypen. Gör den interna försörjningslogiken granskbar för teamet utan att
// den läcker in i kundtexten – hela poängen med v2 är att kunden aldrig ser den.
export function SourceNote({ source }: { source: string }) {
  return (
    <div
      className="mt-3 px-3 py-2 border border-dashed text-sm"
      style={{ borderColor: "var(--border-subtle)", color: "var(--muted-foreground)" }}
    >
      <span className="uppercase tracking-[0.2em] text-[10px] font-semibold">Internt</span>
      <span className="mx-2">·</span>
      {source}
    </div>
  );
}
