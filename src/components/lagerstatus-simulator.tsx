"use client";

import { useState } from "react";
import {
  getCardStatus,
  getLagervaraBox,
  getOnlineBox,
  getStoreBox,
  onlineOptions,
  storeOptions,
  STORES,
  STORE_NAME,
  type OnlineState,
  type ProductType,
  type StoreInfo,
  type StoreState,
} from "@/lib/lagerstatus";

// Default-butik för prototypen så rutan har ett konkret butiksnamn innan användaren
// öppnat butiksväljaren. Speglas sedan av det faktiska valet via onSelect.
const DEFAULT_STORE = STORES.find((store) => store.id === "kungens-kurva");
import { ClockIcon, LagerstatusBoxes } from "./status-card";
import { StoreSelectorPanel } from "./store-selector-panel";

type Tab = "produktsida" | "produktkort";

export function LagerstatusSimulator() {
  const [tab, setTab] = useState<Tab>("produktsida");
  const [type, setType] = useState<ProductType>("snabb");
  const [noStoreSelected, setNoStoreSelected] = useState(false);
  const [lagervaraInStores, setLagervaraInStores] = useState(false);
  const [storeState, setStoreState] = useState<StoreState>("i_lager");
  // Lagervarans butiksruta har ett eget scenario (i lager / på väg in / beställningsläge / slut)
  // via "Butik"-väljaren, skilt från online-/centrallagerstatusen i storeState.
  const [lagervaraStoreState, setLagervaraStoreState] = useState<StoreState>("i_lager");
  const [onlineState, setOnlineState] = useState<OnlineState>("i_lager_cl");
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | undefined>(DEFAULT_STORE);

  const onlineSelectOptions = onlineOptions[type];

  // Online-väljaren är inaktiv för lagervara och för möbler (säljs via butikslager) –
  // i båda fallen saknas en separat online-ruta på produktsidan.
  const onlineHidden = type === "lagervara" || (type === "bestall" && !noStoreSelected);

  // Butiksprimär lagervara visar den valda butikens eget saldo. Mock-butiker som inte är "i lager"
  // har 0 i saldo – då "finns i vald butik" är ett manuellt override-läge faller vi tillbaka på 4.
  const lagervaraStoreCount = selectedStore?.stockCount || 4;
  // Lagervara: en enad ruta med fasta rader (butik · online · hämta · hemleverans) i stället för
  // den kanaluppdelade butiks-/online-rutan. "storeState" är här centrallagrets (online) status,
  // och "Butik"-väljaren (lagervaraStoreState) styr den valda butikens egen status.
  const storeBox =
    type === "lagervara"
      ? getLagervaraBox({
          noStoreSelected,
          storeName: selectedStore?.name ?? STORE_NAME,
          onlineState: storeState,
          storeShelfState: lagervaraStoreState,
          storeStockCount: lagervaraStoreCount,
          inOtherStores: lagervaraInStores,
        })
      : getStoreBox(storeState, noStoreSelected, selectedStore?.name ?? STORE_NAME, type, onlineState, lagervaraInStores, false, lagervaraStoreCount, lagervaraStoreState);
  // Lagervara har ingen separat online-ruta längre – online-saldot bor i den enade rutan ovan.
  const onlineBox = type === "lagervara" ? null : getOnlineBox(onlineState, type, noStoreSelected);
  const cardStatus = getCardStatus(storeState, onlineState, noStoreSelected, type);

  function onTypeChange(nextType: ProductType) {
    setType(nextType);
    setStoreState("i_lager");
    setOnlineState("i_lager_cl");
    // Lagervara speglar den valda butikens egen status (så "i lager / beställs till", hämttid
    // och hemleverans stämmer med butiken). Finns en vald butik utgår vi från dess status.
    setLagervaraStoreState(nextType === "lagervara" && selectedStore && !noStoreSelected ? selectedStore.state : "i_lager");
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <aside className="order-last lg:order-first lg:w-72 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto bg-white border-t lg:border-t-0 lg:border-r border-[#e0ddd7] p-6 flex flex-col gap-6">
        <div className="h-px bg-[#ebebeb]" />

        <fieldset className="flex flex-col gap-2">
          <legend className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#999] mb-2">
            Produkttyp
          </legend>
          <RadioPill checked={type === "snabb"} label="Snabbrörlig" onChange={() => onTypeChange("snabb")} />
          <RadioPill checked={type === "bestall"} label="Möbler (större)" onChange={() => onTypeChange("bestall")} />
          <RadioPill checked={type === "lagervara"} label="Lagervara (via butik)" onChange={() => onTypeChange("lagervara")} />
        </fieldset>

        <div className="h-px bg-[#ebebeb]" />

        <div className="flex flex-col gap-4">
          {/* Lagervara har ingen separat online-ruta – dess lagerstatus ÄR online-saldot
              och styrs av "Online"-väljaren nedan. Den dedikerade online-väljaren döljs
              därför helt för lagervara (för möbler utan ombudskanal visas den nedtonad). */}
          {type !== "lagervara" && (
            <div className={onlineHidden ? "opacity-40" : ""}>
              <SelectField label="Online" value={onlineState} disabled={onlineHidden} options={onlineSelectOptions} onChange={(v) => setOnlineState(v as OnlineState)} />
            </div>
          )}
          {/* För lagervara ÄR detta online-/centrallagerstatusen (gäller oavsett butiksval, går
              att ändra utan vald butik) och heter därför "Online". För snabb/möbler är det den
              valda butikens eget saldo och saknar mening utan vald butik → då disablad. */}
          <SelectField label={type === "lagervara" ? "Online" : "Butik"} value={storeState} disabled={noStoreSelected && type !== "lagervara"} options={storeOptions[type]} onChange={(v) => setStoreState(v as StoreState)} />
          {/* Lagervara: "Butik"-väljaren styr den valda butikens egen status (i lager / på väg in /
              beställningsläge / slut). "Ej tillgänglig" = butiken för inte varan → tas dit via
              centrallager. Disablad utan vald butik (då finns ingen butiksstatus att visa). */}
          {type === "lagervara" && (
            <SelectField label="Butik" value={lagervaraStoreState} disabled={noStoreSelected} options={storeOptions.lagervara} onChange={(v) => setLagervaraStoreState(v as StoreState)} />
          )}
        </div>

        <div className="h-px bg-[#ebebeb]" />

        <div className="flex flex-col gap-3">
          <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#999]">Kontext</p>
          <CheckRow
            checked={noStoreSelected}
            label="Ingen butik vald"
            onChange={() => setNoStoreSelected(!noStoreSelected)}
          />
          {/* Kontext: lägger bara till en "hämta direkt i N butiker"-länk, har inget eget saldo. */}
          {type === "lagervara" && (
            <CheckRow
              checked={lagervaraInStores}
              label="Finns i andra butiker"
              onChange={() => setLagervaraInStores(!lagervaraInStores)}
            />
          )}
        </div>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <div className="flex gap-0 border-b border-[#e0ddd7] mb-6">
          <TabBtn active={tab === "produktsida"} onClick={() => setTab("produktsida")}>Produktsida</TabBtn>
          <TabBtn active={tab === "produktkort"} onClick={() => setTab("produktkort")} disabled>Produktkort</TabBtn>
        </div>

        {tab === "produktsida" ? (
          <div className="max-w-sm">
            <LagerstatusBoxes storeContent={storeBox} onlineContent={onlineBox} onStoreAction={() => setPanelOpen(true)} />
          </div>
        ) : (
          <div>
            <p className="text-xs text-[#aaa] mb-5 max-w-md">
              Markerat kort visar aktuell kombinator-status. Övriga kort är fasta referensprodukter.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl">
              <ProductCard title="Soffa Lova 3-sits" price="7 995 kr" muted status={<CardStatusBadge tone="green" label="Finns i lager" />} />
              <ProductCard
                title="Fåtölj Lova"
                price="3 495 kr"
                featured
                status={<CardStatusBadge tone={cardStatus.tone} label={cardStatus.sublabel ? `${cardStatus.label} · ${cardStatus.sublabel}` : cardStatus.label} />}
              />
              <ProductCard title="Bord Eker runt" price="4 295 kr" muted status={<CardStatusBadge tone="neutral" label="Beställningsvara · 4–8 v" />} />
            </div>
          </div>
        )}
      </main>

      <StoreSelectorPanel
        open={panelOpen}
        selectedStoreId={selectedStore?.id}
        onClose={() => setPanelOpen(false)}
        onSelect={(store) => {
          setSelectedStore(store);
          if (type === "lagervara") {
            // Lagervara: byt upphämtningsbutik → spegla butikens egen status så att hela rutan
            // (i lager / beställs till, hämttid, hemleverans) stämmer skarpt med vald butik.
            // Centrallagrets (online) status ligger kvar och styrs separat av "Online"-väljaren.
            setLagervaraStoreState(store.state);
          } else {
            // Snabb/möbler: butikens eget saldo ÄR rutan, så storeState följer valet.
            setStoreState(store.state);
          }
          setNoStoreSelected(false);
        }}
      />
    </div>
  );
}

function RadioPill({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer rounded-lg border border-[#e8e5e0] bg-white px-4 py-2.5 text-sm text-[#111] hover:border-[#ccc] transition-colors">
      <input type="radio" checked={checked} onChange={onChange} className="h-4 w-4 accent-[var(--success)]" />
      {label}
    </label>
  );
}

function CheckRow({ checked, label, onChange }: { checked: boolean; label: string; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer text-sm text-[#333]">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 accent-[var(--success)]" />
      {label}
    </label>
  );
}

function SelectField({
  label,
  value,
  disabled,
  options,
  onChange,
}: {
  label: string;
  value: string;
  disabled: boolean;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#999] mb-1.5">{label}</p>
      <select value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} className="field">
        {options.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
      </select>
    </div>
  );
}

function TabBtn({ active, disabled, children, onClick }: { active: boolean; disabled?: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`-mb-px px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active ? "border-[#111] text-[#111]" : disabled ? "border-transparent text-[#ccc] cursor-not-allowed" : "border-transparent text-[#aaa] hover:text-[#555]"
      }`}
    >
      {children}
    </button>
  );
}

function ProductCard({ title, price, status, featured = false, muted = false }: {
  title: string;
  price: string;
  status: React.ReactNode;
  featured?: boolean;
  muted?: boolean;
}) {
  return (
    <article className={`overflow-hidden bg-white transition-opacity ${featured ? "border-2 border-[#111]" : "border border-[#e0ddd7]"} ${muted ? "opacity-50" : ""}`}>
      <div className="aspect-[4/3] bg-[#f0ede8]" />
      <div className="p-3 border-t border-[#e0ddd7]">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#aaa] mb-0.5">Mio</p>
        <h3 className="text-sm font-medium text-[#111] leading-snug">{title}</h3>
        <p className="text-sm font-semibold text-[#111] mt-1.5 mb-3">{price}</p>
        {status}
      </div>
    </article>
  );
}

function CardStatusBadge({ tone, label }: { tone: "green" | "amber" | "neutral" | "gray"; label: string }) {
  if (tone === "green") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full shrink-0 bg-[var(--success)]" />
        <span className="text-xs text-[#111]">{label}</span>
      </div>
    );
  }
  if (tone === "gray") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full shrink-0 bg-[var(--dot-muted)]" />
        <span className="text-xs text-[#888]">{label}</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: "var(--success)" }}><ClockIcon size={12} /></span>
      <span className="text-xs text-[#111]">{label}</span>
    </div>
  );
}
