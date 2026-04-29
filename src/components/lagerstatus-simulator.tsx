"use client";

import { useState } from "react";
import {
  getCardStatus,
  getOnlineBox,
  getScenarioLabel,
  getStoreBox,
  onlineOptions,
  storeOptions,
  type BoxContent,
  type BoxRow,
  type OnlineState,
  type ProductType,
  type StoreState,
} from "@/lib/lagerstatus";

type Tab = "produktsida" | "produktkort";

const icons = {
  store: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M3 9l1-5h16l1 5" />
      <path d="M3 9h18v11a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9Z" />
      <path d="M9 21v-9h6v9" />
    </svg>
  ),
  truck: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v4h-7V8Z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="m3 12 9-9 9 9" />
      <path d="M9 21v-9h6v9" />
      <path d="M3 12v9h18v-9" />
    </svg>
  ),
  clock: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
};

export function LagerstatusSimulator() {
  const [tab, setTab] = useState<Tab>("produktsida");
  const [type, setType] = useState<ProductType>("snabb");
  const [noStoreSelected, setNoStoreSelected] = useState(false);
  const [directToCustomer, setDirectToCustomer] = useState(false);
  const [storeState, setStoreState] = useState<StoreState>("i_lager");
  const [onlineState, setOnlineState] = useState<OnlineState>("i_lager_cl");

  const onlineSelectOptions =
    type === "bestall" && directToCustomer ? onlineOptions.snabb : onlineOptions[type];

  const storeBox = getStoreBox(storeState, noStoreSelected, type);
  const onlineBox = getOnlineBox(onlineState, type, directToCustomer);
  const cardStatus = getCardStatus(
    storeState,
    onlineState,
    noStoreSelected,
    type,
    directToCustomer,
  );

  function onTypeChange(nextType: ProductType) {
    setType(nextType);
    setStoreState("i_lager");
    setOnlineState("i_lager_cl");
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(134,153,138,0.18),_transparent_32%),linear-gradient(180deg,_#f7f4ee_0%,_#f2eee6_45%,_#ebe6dc_100%)] text-[var(--foreground)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-[var(--border)] bg-white/82 p-6 backdrop-blur lg:sticky lg:top-0 lg:h-screen lg:w-80 lg:border-r lg:border-b-0">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.32em] text-[var(--muted-foreground)]">
            Mio Lagerstatus
          </p>
          <h1 className="max-w-xs text-2xl font-semibold tracking-[-0.04em]">
            Next.js-kombinator för butik och leverans
          </h1>
          <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--muted-foreground)]">
            Byggd från HTML-prototypen och den uppdaterade logiken i markdown-specen.
          </p>

          <div className="mt-8 space-y-6">
            <fieldset>
              <legend className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Produkttyp
              </legend>
              <div className="grid gap-2">
                <RadioRow
                  checked={type === "snabb"}
                  label="Snabbrörlig"
                  onChange={() => onTypeChange("snabb")}
                />
                <RadioRow
                  checked={type === "bestall"}
                  label="Beställningsvara"
                  onChange={() => onTypeChange("bestall")}
                />
              </div>
            </fieldset>

            <fieldset className="rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-4">
              <legend className="px-1 text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Kontext
              </legend>
              <div className="grid gap-3 pt-2">
                <CheckboxRow
                  checked={noStoreSelected}
                  label="Ingen butik vald"
                  onChange={() => setNoStoreSelected((current) => !current)}
                />
                <CheckboxRow
                  checked={directToCustomer}
                  label="CL/WL/DI direkt till kund"
                  onChange={() => setDirectToCustomer((current) => !current)}
                />
              </div>
            </fieldset>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Butik
              </label>
              <select
                value={storeState}
                disabled={noStoreSelected}
                onChange={(event) => setStoreState(event.target.value as StoreState)}
                className="field"
              >
                {storeOptions[type].map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={type === "bestall" && !noStoreSelected && !directToCustomer ? "opacity-45" : ""}>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
                Online
              </label>
              <select
                value={onlineState}
                disabled={type === "bestall" && !noStoreSelected && !directToCustomer}
                onChange={(event) => setOnlineState(event.target.value as OnlineState)}
                className="field"
              >
                {onlineSelectOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-10">
          <div className="rounded-[2rem] border border-white/60 bg-white/65 p-4 shadow-[0_22px_90px_rgba(61,49,30,0.08)] backdrop-blur md:p-6">
            <div className="flex gap-1 border-b border-[var(--border)]">
              <TabButton active={tab === "produktsida"} onClick={() => setTab("produktsida")}>
                Produktsida
              </TabButton>
              <TabButton active={tab === "produktkort"} onClick={() => setTab("produktkort")}>
                Produktkort
              </TabButton>
            </div>

            <p className="mt-5 text-xs font-medium uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
              {getScenarioLabel(type, storeState, onlineState, noStoreSelected, directToCustomer)}
            </p>

            {tab === "produktsida" ? (
              <div className="mt-6 grid max-w-5xl gap-4 xl:grid-cols-[minmax(0,420px)_minmax(0,420px)]">
                <StatusCard eyebrow="Ruta 1" title="Hämta i butik" content={storeBox} />
                {onlineBox ? (
                  <StatusCard eyebrow="Ruta 2" title="Leverans" content={onlineBox} />
                ) : (
                  <StatusPlaceholder />
                )}
              </div>
            ) : (
              <div className="mt-6">
                <p className="mb-4 max-w-xl text-sm text-[var(--muted-foreground)]">
                  Markerat kort visar den aktiva kombinatorstatusen. Övriga kort ligger kvar som
                  referensprodukter.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  <ReferenceCard
                    muted
                    title="Soffa Lova 3-sits"
                    price="7 995 kr"
                    status={<DotStatus tone="green" label="Finns i lager" />}
                  />
                  <ReferenceCard
                    featured
                    title="Fåtölj Lova"
                    price="3 495 kr"
                    status={
                      <DotStatus
                        tone={cardStatus.tone}
                        label={
                          cardStatus.sublabel
                            ? `${cardStatus.label} · ${cardStatus.sublabel}`
                            : cardStatus.label
                        }
                      />
                    }
                  />
                  <ReferenceCard
                    muted
                    title="Bord Eker runt"
                    price="4 295 kr"
                    status={<DotStatus tone="neutral" label="Beställningsvara · 4–8 v" />}
                  />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function StatusCard({
  eyebrow,
  title,
  content,
}: {
  eyebrow: string;
  title: string;
  content: BoxContent;
}) {
  return (
    <section className="rounded-[1.75rem] border border-[var(--border)] bg-[var(--card)] p-5 shadow-[0_10px_30px_rgba(34,30,24,0.06)]">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted-foreground)]">
        {eyebrow}
      </p>
      <h2 className="mt-1 text-xl font-semibold tracking-[-0.03em]">{title}</h2>
      <div className="mt-5">
        {content.rows.map((row, index) => (
          <div key={`${row.kind}-${row.text}`}>
            {index > 0 && <div className="my-4 border-t border-[var(--border)]" />}
            <BoxRowView row={row} />
          </div>
        ))}
        {content.footerLink ? (
          <div className="mt-4 border-t border-[var(--border)] pt-4">
            <button className="text-sm font-medium underline decoration-[rgba(43,58,44,0.3)] underline-offset-4">
              {content.footerLink}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function BoxRowView({ row }: { row: BoxRow }) {
  if (row.kind === "stock") {
    return (
      <div className="flex items-center gap-3">
        <span
          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
            row.tone === "positive" ? "bg-[var(--success)]" : "bg-[#c7c7c2]"
          }`}
        />
        <p
          className={`flex-1 text-sm leading-6 ${
            row.tone === "positive" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]"
          }`}
        >
          {row.text}
        </p>
        {row.action ? (
          <button className="text-xs font-medium underline decoration-[rgba(43,58,44,0.3)] underline-offset-4">
            {row.action}
          </button>
        ) : null}
      </div>
    );
  }

  if (row.kind === "eta") {
    return (
      <div className="flex items-center gap-3">
        <span className="icon text-[var(--success)]">{icons.clock}</span>
        <p className="flex-1 text-sm leading-6">{row.text}</p>
        {row.action ? (
          <button className="text-xs font-medium underline decoration-[rgba(43,58,44,0.3)] underline-offset-4">
            {row.action}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <span className="icon text-[var(--muted-foreground)]">{icons[row.icon]}</span>
      <p className="flex-1 text-sm leading-6">{row.text}</p>
      {"price" in row && row.price ? (
        <span className="text-xs font-medium text-[var(--muted-foreground)]">{row.price}</span>
      ) : null}
    </div>
  );
}

function StatusPlaceholder() {
  return (
    <section className="rounded-[1.75rem] border border-dashed border-[var(--border)] bg-[rgba(255,255,255,0.42)] p-5 text-sm text-[var(--muted-foreground)]">
      Ruta 2 döljs i det här scenariot eftersom hemleveransen hanteras i Ruta 1.
    </section>
  );
}

function ReferenceCard({
  title,
  price,
  status,
  featured = false,
  muted = false,
}: {
  title: string;
  price: string;
  status: React.ReactNode;
  featured?: boolean;
  muted?: boolean;
}) {
  return (
    <article
      className={`overflow-hidden rounded-[1.5rem] bg-white shadow-[0_18px_45px_rgba(45,38,27,0.08)] ${
        featured ? "border-2 border-[var(--foreground)]" : "border border-[var(--border)]"
      } ${muted ? "opacity-55" : ""}`}
    >
      <div className="aspect-[4/3] bg-[linear-gradient(135deg,_rgba(184,193,180,0.45),_rgba(227,220,203,0.65))]" />
      <div className="p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted-foreground)]">Mio</p>
        <h3 className="mt-1 text-sm font-medium">{title}</h3>
        <p className="mt-2 text-sm font-semibold">{price}</p>
        <div className="mt-3">{status}</div>
      </div>
    </article>
  );
}

function DotStatus({
  tone,
  label,
}: {
  tone: "green" | "amber" | "neutral" | "gray";
  label: string;
}) {
  if (tone === "gray") {
    return (
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[#c7c7c2]" />
        <span className="text-xs text-[var(--muted-foreground)]">{label}</span>
      </div>
    );
  }

  if (tone === "green") {
    return (
      <div className="flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
        <span className="text-xs">{label}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="icon text-[var(--success)]">{icons.clock}</span>
      <span className="text-xs">{label}</span>
    </div>
  );
}

function RadioRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm">
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-[var(--foreground)]" />
      <span>{label}</span>
    </label>
  );
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 text-sm">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[var(--foreground)]" />
      <span>{label}</span>
    </label>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-4 py-3 text-sm font-medium transition ${
        active
          ? "border-[var(--foreground)] text-[var(--foreground)]"
          : "border-transparent text-[var(--muted-foreground)]"
      }`}
    >
      {children}
    </button>
  );
}
