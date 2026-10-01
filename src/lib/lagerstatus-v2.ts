// v2 – "en plats och ett löfte"
//
// Modellen bygger på två rader i stället för två kanalrutor:
//
//   Rad 1  Butik     – en fysisk plats kunden kan åka till. Får säga nej, men bara med
//                      ett alternativ i samma mening ("Slut i X — finns i Y, 14 km").
//   Rad 2  Leverans  – sidans löfte om att köpet går att genomföra. Säger ett datum,
//                      aldrig ett lagerläge, och aldrig nej till något kunden kan göra.
//
// Den bärande skillnaden mot v1: ordet "online" finns inte i kundtexten. För kunden är
// "online" kanalen hen står i, inte ett lager – så "slut online" läses som "går inte att
// köpa här" även när varan går alldeles utmärkt att få hem via butiken. Rad 2 påstår
// därför ett datum, och vilken källa som försörjer datumet (centrallager eller butik) är
// en ren backend-uträkning. Då blir "försörjs bara via butik" osynligt för kunden i
// stället för ett tyst hål i gränssnittet.
//
// Inga antal visas någonstans – saldosiffror blir fel i samma sekund som någon handlar i
// butiken, och datumet bär redan all information siffran skulle gett.

import { STORES, type StoreState } from "./lagerstatus";

export type V2ProductType = "snabb" | "mobler" | "outlet";

// Butikens läge. "ej_i_sortiment" är strukturellt (varan förs aldrig i butik) – skilt från
// "slut" som är ett saldo som rör sig. Bara det strukturella får dölja raden.
export type V2StoreState = "i_lager" | "pa_vag_in" | "bestalls" | "slut" | "ej_i_sortiment";

// Centrallagrets läge. Exponeras aldrig i kundtext – används bara för att räkna fram datum.
export type V2OnlineState = "i_lager" | "pa_vag_in" | "tillverkas" | "slut";

// Hur ett köp på sajten försörjs. "via_butik" = DI → butik → kund (dagens directToCustomer=av).
// Kunden ser ingen skillnad; den styr bara vilket datum rad 2 landar på.
export type V2Supply = "direkt" | "via_butik";

export type V2Tone = "ok" | "wait" | "none";

export type V2Action = {
  label: string;
  kind: "stores" | "postcode" | "notify";
};

export type V2StoreRow = {
  tone: V2Tone;
  text: string;
  action?: V2Action;
};

export type V2DeliveryRow = {
  tone: V2Tone;
  text: string;
  // Framhävd avslutning på meningen, t.ex. postnumret i "… till 111 17".
  strong?: string;
  action?: V2Action;
};

export type V2Result = {
  store: V2StoreRow | null;
  delivery: V2DeliveryRow;
  // Länk under båda raderna. Bor utanför raderna eftersom den gäller ett alternativ till
  // hela situationen, inte en detalj i butiksraden – och för att action-platsen i raden ska
  // få behålla sin fasta betydelse ("Byt butik" / "Ändra").
  footerLink: V2Action | null;
  // Intern förklaring – visas i prototypen under en "visas inte för kund"-etikett så teamet
  // kan se vilken källa som gav datumet. Ska aldrig ut i produktion.
  source: string;
};

export type V2Input = {
  productType: V2ProductType;
  storeState: V2StoreState;
  onlineState: V2OnlineState;
  supply: V2Supply;
  storeSelected: boolean;
  storeName: string;
  // Antal butiker med saldo – används bara i texten när ingen butik är vald.
  storesWithStock: number;
  // Andra butiker som har varan på hyllan just nu. Flaggas när den valda butiken inte kan ge
  // den direkt – då är en annan butik den snabbaste vägen och det ska synas utan att kunden
  // behöver öppna butikspanelen för att upptäcka det.
  otherStoresWithStock: number;
  // Knapphet som tröskel, aldrig som tal: ett exakt saldo blir fel i samma sekund som någon
  // handlar i butiken, och "2 kvar" läses som ett löfte.
  lowStock: boolean;
  postcode: string | null;
  // Går varan att leverera över huvud taget? Raden skiljer medvetet inte på hem och ombud:
  // "Levereras" täcker båda, valet mellan dem är ett kassabeslut, och ett enda verb gör att
  // modellen slipper en gren per leveranssätt.
  deliverable: boolean;
};

// --- Datum ------------------------------------------------------------------

const DAY_MS = 86_400_000;

// Ankomstdatum till butik skrivs som veckodag + datum – det är ett faktiskt datum i systemet.
// Allt annat uttrycks som ledtidsspann (se Lead.span); veckonummer används inte, eftersom det
// inte finns i dagens data.
function formatArrival(days: number): string {
  return new Intl.DateTimeFormat("sv-SE", { weekday: "short", day: "numeric", month: "short" })
    .format(new Date(TODAY.getTime() + days * DAY_MS))
    .replace(/\./g, "");
}

// Ledtider per läge och källa. Butiksvägen är alltid längre än direktvägen – varan ska först
// till butiken och sedan ut till kund.
//
// `days` används för att rangordna vägarna och för att räkna fram butikens ankomstdatum.
// `span` är det kunden läser på leveransraden. Butiksraden visar ett datum när det finns ett
// faktiskt ankomstdatum att visa; leveransraden visar ett spann eftersom transporttiden är en
// uppskattning och ett exakt datum där vore falsk precision.
// `weeks` styr prick kontra klocka: räknas ledtiden i veckor är varan inte här, den är på
// ingång. Egen flagga i stället för en tröskel på `days`, eftersom butikens ankomstdatum och
// kundens leveranstid är två olika saker och kan ligga på var sin sida om en gräns.
type Lead = { days: number; span: string; weeks: boolean };

const ONLINE_LEAD: Record<V2OnlineState, Lead | null> = {
  i_lager: { days: 4, span: "2–4 dagar", weeks: false },
  pa_vag_in: { days: 12, span: "2–3 veckor", weeks: true },
  tillverkas: { days: 42, span: "4–8 veckor", weeks: true },
  slut: null,
};

const STORE_LEAD: Record<V2StoreState, Lead | null> = {
  i_lager: { days: 5, span: "3–5 dagar", weeks: false },
  pa_vag_in: { days: 12, span: "2–3 veckor", weeks: true },
  bestalls: { days: 42, span: "4–8 veckor", weeks: true },
  slut: null,
  ej_i_sortiment: null,
};

// --- Postnummer -------------------------------------------------------------

export function normalizePostcode(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  if (digits.length !== 5) return null;
  return `${digits.slice(0, 3)} ${digits.slice(3)}`;
}

// Mock: postnummer som börjar på 98 ligger utanför hemleveransområdet. Finns för att kunna
// visa upp att beskedet hör hemma i raden, inte i kassan.
export function isDeliverable(postcode: string): boolean {
  return !postcode.replace(/\s/g, "").startsWith("98");
}

// --- Butiksdata -------------------------------------------------------------

const STORE_STATE_MAP: Record<StoreState, V2StoreState> = {
  i_lager: "i_lager",
  pa_vag_in: "pa_vag_in",
  bestallningslage: "bestalls",
  ej_tillganglig: "slut",
};

export function toV2StoreState(state: StoreState): V2StoreState {
  return STORE_STATE_MAP[state];
}

export const storesWithStockCount = STORES.filter((store) => store.state === "i_lager").length;

// --- Rad 1: butik -----------------------------------------------------------
//
// En enda formulering – "I lager hos {butik}" – med en tidsangivelse som varierar: ingen alls
// när varan står på hyllan, "från {datum}" när en inleverans är lagd, "inom {spann}" när den
// beställs dit. Lagerläget i sig (på väg in, beställningsläge) nämns aldrig; det är systemets
// kategori och säger inte vad kunden får.

function buildStoreRow(input: V2Input): V2StoreRow | null {
  const { storeName, storeState, storeSelected, storesWithStock, lowStock } = input;

  // Strukturellt nej: varan förs inte i butik alls. Raden döljs – men bara på den här
  // grunden, aldrig på ett saldo, så att produkten ser likadan ut mellan två besök.
  if (storeState === "ej_i_sortiment") return null;

  if (!storeSelected) {
    if (storesWithStock > 0) {
      return {
        tone: "ok",
        text: `I lager i ${storesWithStock} butiker`,
        action: { label: "Välj butik", kind: "stores" },
      };
    }
    return {
      tone: "none",
      text: "Inte i lager i någon butik just nu",
      action: { label: "Visa butiker", kind: "stores" },
    };
  }

  const action: V2Action = { label: "Byt butik", kind: "stores" };

  if (storeState === "i_lager") {
    // Knapphetssignalen ersätter "I lager" i stället för att läggas till – pricken är fortsatt
    // grön, varan finns, men ordet säger att den kan vara borta imorgon.
    return {
      tone: "ok",
      text: lowStock ? `Få kvar hos ${storeName}` : `I lager hos ${storeName}`,
      action,
    };
  }

  if (storeState === "pa_vag_in") {
    const when = formatArrival(STORE_LEAD.pa_vag_in!.days);
    return { tone: "wait", text: `I lager hos ${storeName} från ${when}`, action };
  }

  if (storeState === "bestalls") {
    return {
      tone: "wait",
      text: `I lager hos ${storeName} inom ${STORE_LEAD.bestalls!.span}`,
      action,
    };
  }

  return { tone: "none", text: `Tillfälligt slut hos ${storeName}`, action };
}

// Alternativet när vald butik inte kan ge varan direkt: en annan butik har den på hyllan nu.
// Antalet räcker för att få någon att klicka – var butikerna ligger hör hemma i panelen.
function buildFooterLink(input: V2Input): V2Action | null {
  if (!input.storeSelected) return null;
  if (input.storeState === "ej_i_sortiment") return null;
  if (input.storeState === "i_lager") return null;
  if (input.otherStoresWithStock < 1) return null;
  return { label: `Finns i ${input.otherStoresWithStock} butiker`, kind: "stores" };
}

// --- Rad 2: leverans --------------------------------------------------------

// Rad 1 svarar "när kan jag hämta den", rad 2 "när kan jag få den levererad". Lagerläget
// bakom datumet (på väg in, beställningsläge) nämns inte – det är systemets kategori, och i
// samma mening som ett spann blir det oklart vilket av dem spannet gäller.
type Route = { lead: Lead; source: "onlinelager" | "butik" };

// Snabbaste trovärdiga vägen hem. Både centrallagret och butiken kan försörja; kunden ska
// aldrig behöva veta vilken det blev.
function resolveRoute(input: V2Input): Route | null {
  const routes: Route[] = [];

  if (input.supply === "direkt") {
    const lead = ONLINE_LEAD[input.onlineState];
    if (lead !== null) {
      routes.push({ lead, source: "onlinelager" });
    }
  }

  // Butiksvägen finns så snart någon butik kan försörja – vald butik om den har ett läge,
  // annars kedjan generellt när det finns saldo ute i butikerna.
  const storeLead = input.storeSelected
    ? STORE_LEAD[input.storeState]
    : input.storesWithStock > 0
      ? STORE_LEAD.i_lager
      : null;
  if (storeLead !== null) {
    routes.push({ lead: storeLead, source: "butik" });
  }

  if (routes.length === 0) return null;
  return routes.reduce((a, b) => (b.lead.days < a.lead.days ? b : a));
}

function buildDeliveryRow(input: V2Input, route: Route | null): V2DeliveryRow {
  // Det enda äkta nejet: varan går aldrig att skicka. Ska synas tydligt – och registreras
  // bara om komponenten inte redan ropat "slut" på varor som gick att köpa.
  if (!input.deliverable) {
    return {
      tone: "none",
      text: "Säljs bara i butik — går inte att leverera",
    };
  }

  if (route === null) {
    return {
      tone: "none",
      text: "Går inte att köpa just nu",
      action: { label: "Meddela mig när den finns", kind: "notify" },
    };
  }

  if (!input.postcode) {
    return {
      tone: "ok",
      text: "Ange postnummer för leveranstid",
      action: { label: "Ange postnummer", kind: "postcode" },
    };
  }

  const change: V2Action = { label: "Ändra", kind: "postcode" };

  if (!isDeliverable(input.postcode)) {
    return {
      tone: "none",
      text: `Till ${input.postcode} levererar vi inte — hämta i butik`,
      action: change,
    };
  }

  // Samma betydelse som på butiksraden: grön prick = går att få, klocka = går att få men
  // ligger en bit bort. Gränsen går där ledtiden slutar räknas i dagar.
  const tone: V2Tone = route.lead.weeks ? "wait" : "ok";

  const lead = `Levereras inom ${route.lead.span}`;

  // Postnumret sitter i meningen ("… till 111 17") och lyfts fram, så raden läses som ett
  // påstående om kundens adress i stället för som en status med ett vidhängt fält.
  return { tone, text: `${lead} till `, strong: input.postcode, action: change };
}

function describeSource(input: V2Input, route: Route | null): string {
  if (!input.deliverable) return "Inget leveranssätt finns för varan";
  if (route === null) return "Ingen källa kan försörja – inget datum att lova";
  const via =
    route.source === "butik"
      ? input.storeSelected
        ? `butikslagret i ${input.storeName}`
        : "butikslagret"
      : "centrallagret";
  const direkt = input.supply === "via_butik" ? " (produkten kan inte skickas direkt från onlinelagret)" : "";
  return `Datum från ${via}${direkt}`;
}

// Prototypens "idag". Modulnivå så alla datum i en session hänger ihop.
const TODAY = new Date();

export function getV2Status(input: V2Input): V2Result {
  const route = resolveRoute(input);
  return {
    store: buildStoreRow(input),
    delivery: buildDeliveryRow(input, route),
    footerLink: buildFooterLink(input),
    source: describeSource(input, route),
  };
}

// --- Väljare för simulatorn -------------------------------------------------

export const v2ProductOptions: { id: V2ProductType; label: string }[] = [
  { id: "snabb", label: "Snabbrörlig" },
  { id: "mobler", label: "Möbler (större)" },
  { id: "outlet", label: "Outlet (butiksexklusiv)" },
];

// Väljarna använder v1:s interna namn – "På väg in", "Beställningsläge", "Ej tillgänglig" –
// så att samma scenario går att hitta i båda flikarna utan att översätta i huvudet. Det är
// systemets vokabulär, inte kundens: v2:s poäng är just att de orden stannar här inne.
export const v2StoreOptions: { id: V2StoreState; label: string }[] = [
  { id: "i_lager", label: "I lager" },
  { id: "pa_vag_in", label: "På väg in" },
  { id: "bestalls", label: "Beställningsläge" },
  { id: "slut", label: "Tillfälligt slut" },
  { id: "ej_i_sortiment", label: "Ej tillgänglig" },
];

export const v2OnlineOptions: { id: V2OnlineState; label: string }[] = [
  { id: "i_lager", label: "I lager (CL/WL/DI)" },
  { id: "pa_vag_in", label: "På väg in online" },
  { id: "tillverkas", label: "Beställningsläge online" },
  { id: "slut", label: "Ej tillgänglig" },
];

export const v2SupplyOptions: { id: V2Supply; label: string }[] = [
  { id: "direkt", label: "Direkt från onlinelagret" },
  { id: "via_butik", label: "Endast via butik" },
];
