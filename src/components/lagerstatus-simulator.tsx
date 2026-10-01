"use client";

import { useState } from "react";
import {
  getCardStatus,
  getLagervaraBox,
  getOnlineBox,
  getStoreBox,
  lagervaraStoreOptions,
  onlineOptions,
  storeOptions,
  toLagervaraStoreState,
  OTHER_STORES_COUNT,
  STORES,
  STORE_NAME,
  type LagervaraStoreState,
  type OnlineState,
  type ProductType,
  type StoreInfo,
  type StoreState,
} from "@/lib/lagerstatus";

// Default-butik för prototypen så rutan har ett konkret butiksnamn innan användaren
// öppnat butiksväljaren. Speglas sedan av det faktiska valet via onSelect.
const DEFAULT_STORE = STORES.find((store) => store.id === "kungens-kurva");
import {
  getV2Status,
  storesWithStockCount,
  toV2StoreState,
  v2OnlineOptions,
  v2ProductOptions,
  v2StoreOptions,
  type V2OnlineState,
  type V2ProductType,
  type V2StoreState,
} from "@/lib/lagerstatus-v2";
import { ClockIcon, LagerstatusBoxes } from "./status-card";
import { StatusV2, SourceNote } from "./status-v2";
import { StoreSelectorPanel } from "./store-selector-panel";

type Tab = "produktsida" | "produktsida-v2" | "produktkort";

export function LagerstatusSimulator() {
  const [tab, setTab] = useState<Tab>("produktsida");
  const [type, setType] = useState<ProductType>("snabb");
  const [noStoreSelected, setNoStoreSelected] = useState(false);
  const [lagervaraInStores, setLagervaraInStores] = useState(false);
  // Redan lagda inleveranser på väg in till enstaka butiker – skilt från hyllsaldot ovan. Enda
  // spåret som räddar köpet när centrallagret är helt slut och inget står på någon hylla.
  const [lagervaraIncomingInStores, setLagervaraIncomingInStores] = useState(false);
  const [storeState, setStoreState] = useState<StoreState>("i_lager");
  // Lagervarans butiksruta har ett eget scenario (i lager / på väg in / slut) via "Butik"-
  // väljaren, skilt från online-/centrallagerstatusen i storeState. Beställningsläge saknas
  // avsiktligt – det är centrallagrets kanal, se LagervaraStoreState.
  const [lagervaraStoreState, setLagervaraStoreState] = useState<LagervaraStoreState>("i_lager");
  const [onlineState, setOnlineState] = useState<OnlineState>("i_lager_cl");
  // Vissa snabbrörliga produkter går inte att skicka till ombud alls, oavsett lagerstatus
  // (t.ex. skrymmande varor) – en egen switch skild från online-lagerstatusen.
  const [ombudAvailable, setOmbudAvailable] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreInfo | undefined>(DEFAULT_STORE);

  // --- v2: "en plats och ett löfte" ----------------------------------------
  // Egen uppsättning state så v1 kan stå kvar orörd bredvid och ställas mot den.
  const [v2Type, setV2Type] = useState<V2ProductType>("mobler");
  const [v2StoreState, setV2StoreState] = useState<V2StoreState>("i_lager");
  const [v2OnlineState, setV2OnlineState] = useState<V2OnlineState>("i_lager");
  const [v2StoreSelected, setV2StoreSelected] = useState(true);
  // En enda växel: går varan att leverera eller inte. Hem kontra ombud är ett kassabeslut
  // och syns därför inte i statusen.
  const [v2Deliverable, setV2Deliverable] = useState(true);
  // Andra butiker med varan på hyllan just nu – egen växel, det följer inte av den valda
  // butikens läge.
  const [v2OtherStores, setV2OtherStores] = useState(true);
  const [v2Postcode, setV2Postcode] = useState<string | null>(null);
  const [v2Store, setV2Store] = useState<StoreInfo | undefined>(DEFAULT_STORE);

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
          incomingInOtherStores: lagervaraIncomingInStores,
        })
      : getStoreBox(storeState, noStoreSelected, selectedStore?.name ?? STORE_NAME, type, onlineState, lagervaraInStores, false, lagervaraStoreCount, lagervaraStoreState);
  // Lagervara har ingen separat online-ruta längre – online-saldot bor i den enade rutan ovan.
  const onlineBox = type === "lagervara" ? null : getOnlineBox(onlineState, type, noStoreSelected, ombudAvailable);
  const cardStatus = getCardStatus(storeState, onlineState, noStoreSelected, type);

  const isV2 = tab === "produktsida-v2";
  const v2Result = getV2Status({
    productType: v2Type,
    storeState: v2StoreState,
    onlineState: v2OnlineState,
    storeSelected: v2StoreSelected,
    storeName: v2Store?.name ?? STORE_NAME,
    storesWithStock: storesWithStockCount,
    otherStoresWithStock: v2OtherStores ? OTHER_STORES_COUNT : 0,
    // Mock-butiker utan saldo har 0 – då faller raden tillbaka på "I lager hos {butik}".
    storeStockCount: v2Store?.stockCount || 4,
    postcode: v2Postcode,
    // Outlet är butiksexklusiv – då finns ingen leveransväg alls.
    deliverable: v2Type === "outlet" ? false : v2Deliverable,
  });

  function onTypeChange(nextType: ProductType) {
    setType(nextType);
    setStoreState("i_lager");
    setOnlineState("i_lager_cl");
    setOmbudAvailable(true);
    // Lagervara speglar den valda butikens egen status (så "i lager / beställs till", hämttid
    // och hemleverans stämmer med butiken). Finns en vald butik utgår vi från dess status.
    setLagervaraStoreState(
      nextType === "lagervara" && selectedStore && !noStoreSelected
        ? toLagervaraStoreState(selectedStore.state)
        : "i_lager",
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      <aside className="order-last lg:order-first lg:w-72 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen lg:overflow-y-auto bg-white border-t lg:border-t-0 lg:border-r border-[#e0ddd7] p-6 flex flex-col gap-6">
        <div className="h-px bg-[#ebebeb]" />

        {isV2 ? (
          <V2Controls
            type={v2Type}
            storeState={v2StoreState}
            onlineState={v2OnlineState}
            storeSelected={v2StoreSelected}
            deliverable={v2Deliverable}
            otherStores={v2OtherStores}
            postcode={v2Postcode}
            onType={setV2Type}
            onStoreState={setV2StoreState}
            onOnlineState={setV2OnlineState}
            onStoreSelected={setV2StoreSelected}
            onDeliverable={setV2Deliverable}
            onOtherStores={setV2OtherStores}
            onPostcode={setV2Postcode}
          />
        ) : (
        <>

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
          {/* Vissa snabbrörliga produkter går inte att skicka till ombud alls, oavsett
              lagerstatus (t.ex. skrymmande varor) – skild från online-lagerstatusen ovan. */}
          {type === "snabb" && (
            <CheckRow
              checked={ombudAvailable}
              label="Går att få via ombud"
              onChange={() => setOmbudAvailable(!ombudAvailable)}
            />
          )}
          {/* För lagervara ÄR detta online-/centrallagerstatusen (gäller oavsett butiksval, går
              att ändra utan vald butik) och heter därför "Online". För snabb/möbler är det den
              valda butikens eget saldo och saknar mening utan vald butik → då disablad. */}
          <SelectField label={type === "lagervara" ? "Online" : "Butik"} value={storeState} disabled={noStoreSelected && type !== "lagervara"} options={storeOptions[type]} onChange={(v) => setStoreState(v as StoreState)} />
          {/* Lagervara: "Butik"-väljaren styr den valda butikens egen status (i lager / på väg in /
              slut). "Ej tillgänglig" = butiken för inte varan → tas dit via centrallager. Inget
              beställningsläge här: butiken har ingen egen leverantörsorder för en lagervara, så
              det läget bor i "Online" ovan. Disablad utan vald butik (båda värdena som finns kvar
              är butiksspecifika och har ingen mening då). */}
          {type === "lagervara" && (
            <SelectField
              label="Butik"
              value={lagervaraStoreState}
              disabled={noStoreSelected}
              options={lagervaraStoreOptions}
              onChange={(v) => setLagervaraStoreState(v as LagervaraStoreState)}
            />
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
          {/* Inleveranser på väg in till enstaka butiker. Syns bara när centrallagervägen är
              långsam eller slut – annars är den vägen både snabbare och säkrare att lova. */}
          {type === "lagervara" && (
            <CheckRow
              checked={lagervaraIncomingInStores}
              label="På väg in till andra butiker"
              onChange={() => setLagervaraIncomingInStores(!lagervaraIncomingInStores)}
            />
          )}
        </div>
        </>
        )}
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <div className="flex gap-0 border-b border-[#e0ddd7] mb-6">
          <TabBtn active={tab === "produktsida"} onClick={() => setTab("produktsida")}>Produktsida</TabBtn>
          <TabBtn active={tab === "produktsida-v2"} onClick={() => setTab("produktsida-v2")}>Produktsida v2</TabBtn>
          <TabBtn active={tab === "produktkort"} onClick={() => setTab("produktkort")} disabled>Produktkort</TabBtn>
        </div>

        {tab === "produktsida" ? (
          <div className="max-w-sm">
            <LagerstatusBoxes storeContent={storeBox} onlineContent={onlineBox} onStoreAction={() => setPanelOpen(true)} />
          </div>
        ) : isV2 ? (
          <div className="max-w-md">
            <StatusV2
              result={v2Result}
              postcode={v2Postcode}
              onOpenStores={() => setPanelOpen(true)}
              onSetPostcode={(value) => {
                setV2Postcode(value);
                // Postnumret är kundens enda inmatning i v2 – när det kommer in finns inget skäl
                // att fortsätta visa butiksraden utan butik, så vi låser upp butikskontexten med.
                setV2StoreSelected(true);
              }}
            />
            <SourceNote source={v2Result.source} />
            <p className="mt-6 text-xs leading-5 text-[#8a8a85] max-w-sm">
              Två rader: en plats och ett löfte. Inga antal, inga fraktpriser, ingen
              onlinelager-status — ordet &quot;online&quot; läses av kunden som kanalen hen står
              i, inte som ett lager, och ett nej där stoppar köp som faktiskt går att göra.
              Leveransraden finns alltid och säger ett datum, oavsett vilken källa som försörjer.
            </p>
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
          if (isV2) {
            setV2Store(store);
            setV2StoreState(toV2StoreState(store.state));
            setV2StoreSelected(true);
            setPanelOpen(false);
            return;
          }
          setSelectedStore(store);
          if (type === "lagervara") {
            // Lagervara: byt upphämtningsbutik → spegla butikens egen status så att hela rutan
            // (i lager / beställs till, hämttid, hemleverans) stämmer skarpt med vald butik.
            // Centrallagrets (online) status ligger kvar och styrs separat av "Online"-väljaren.
            // Butiker i beställningsläge blir "ej tillgänglig" här – för en lagervara betyder
            // det att butiken inte för varan själv, den tas dit via centrallagret.
            setLagervaraStoreState(toLagervaraStoreState(store.state));
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

// Kontrollerna för v2. Egen uppsättning eftersom modellen har andra dimensioner än v1:
// butikens läge och centrallagrets läge är skilda åt, och "försörjs bara via butik" är en
// egen växel i stället för en flagga som döljer en hel ruta.
function V2Controls({
  type,
  storeState,
  onlineState,
  storeSelected,
  deliverable,
  otherStores,
  postcode,
  onType,
  onStoreState,
  onOnlineState,
  onStoreSelected,
  onDeliverable,
  onOtherStores,
  onPostcode,
}: {
  type: V2ProductType;
  storeState: V2StoreState;
  onlineState: V2OnlineState;
  storeSelected: boolean;
  deliverable: boolean;
  otherStores: boolean;
  postcode: string | null;
  onType: (v: V2ProductType) => void;
  onStoreState: (v: V2StoreState) => void;
  onOnlineState: (v: V2OnlineState) => void;
  onStoreSelected: (v: boolean) => void;
  onDeliverable: (v: boolean) => void;
  onOtherStores: (v: boolean) => void;
  onPostcode: (v: string | null) => void;
}) {
  const isOutlet = type === "outlet";

  return (
    <>
      <fieldset className="flex flex-col gap-2">
        <legend className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#999] mb-2">
          Produkttyp
        </legend>
        {v2ProductOptions.map((option) => (
          <RadioPill
            key={option.id}
            checked={type === option.id}
            label={option.label}
            onChange={() => onType(option.id)}
          />
        ))}
      </fieldset>

      <div className="h-px bg-[#ebebeb]" />

      <div className="flex flex-col gap-4">
        <SelectField
          label="Butik"
          value={storeState}
          disabled={false}
          options={v2StoreOptions}
          onChange={(v) => onStoreState(v as V2StoreState)}
        />
        {/* Centrallagrets läge syns aldrig i kundtext – det påverkar bara vilket datum
            leveransraden landar på. Därav etiketten. */}
        <div className={isOutlet ? "opacity-40 pointer-events-none" : ""}>
          <SelectField
            label="Online (internt)"
            value={onlineState}
            disabled={isOutlet}
            options={v2OnlineOptions}
            onChange={(v) => onOnlineState(v as V2OnlineState)}
          />
        </div>
      </div>

      <div className="h-px bg-[#ebebeb]" />

      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-[#999]">Kontext</p>
        <CheckRow
          checked={!storeSelected}
          label="Ingen butik vald"
          onChange={() => onStoreSelected(!storeSelected)}
        />
        <CheckRow
          checked={postcode !== null}
          label="Postnummer angivet"
          onChange={() => onPostcode(postcode === null ? "169 70" : null)}
        />
        <CheckRow
          checked={deliverable}
          label="Går att leverera"
          onChange={() => onDeliverable(!deliverable)}
        />
        <CheckRow
          checked={otherStores}
          label="Finns nu i andra butiker"
          onChange={() => onOtherStores(!otherStores)}
        />
        <p className="text-xs leading-5 text-[#8a8a85] mt-1">
          Postnummer som börjar på 98 ligger utanför hemleveransområdet — skriv t.ex. 981 99 i
          fältet för att se det beskedet.
        </p>
      </div>
    </>
  );
}
