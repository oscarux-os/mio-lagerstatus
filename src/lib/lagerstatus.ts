export type ProductType = "snabb" | "bestall" | "lagervara";
export type StoreState =
  | "i_lager"
  | "pa_vag_in"
  | "bestallningslage"
  | "ej_tillganglig";
export type OnlineState =
  | "i_lager_cl"
  | "pa_vag_in"
  | "bestallningslage"
  | "enbart_bl"
  | "ej_tillganglig";

export type Option<T extends string> = {
  id: T;
  label: string;
};

export type BoxRow =
  | {
      kind: "stock";
      text: string;
      tone: "positive" | "muted";
      action?: string;
    }
  | {
      kind: "eta";
      text: string;
      action?: string;
    }
  | {
      kind: "delivery";
      icon: "store" | "truck" | "package";
      text: string;
      price?: string;
      // Klickbar länk i samma storlek inline efter texten, t.ex. "…inom 4 dagar, byt butik".
      action?: string;
    }
  | {
      kind: "message";
      icon: "store" | "truck" | "package";
      text: string;
      // Klickbar länk i samma storlek inline före texten, t.ex. "Välj butik för att …".
      action?: string;
    }
  | {
      // Fylld info-box (ljusblå) som ersätter leveransraderna, t.ex. uppmaningen att välja
      // butik för att se hämt-/hemleveranstider. Ingen ikon, ingen inline-länk.
      kind: "notice";
      text: string;
    };

export type BoxContent = {
  rows: BoxRow[];
  footerLink?: string;
};

export type CardStatus = {
  tone: "green" | "amber" | "neutral" | "gray";
  label: string;
  sublabel?: string;
};

export const STORE_NAME = "Mio Kungens Kurva";
export const STORE_COUNT = 12;
export const OTHER_STORES_COUNT = 5;

// --- Butiksval-panel: data per butik ---------------------------------------

export type StoreInfo = {
  id: string;
  name: string;
  area: string;
  address: string;
  distanceKm: number;
  state: StoreState;
  stockCount: number;
};

// Alla Mio-butiker i Sverige (från mio.se/butiker). Mock-status per butik.
const STORE_CITIES = [
  "Alingsås", "Avesta", "Arvika", "Bäckebol", "Bromma", "Barkarby", "Borås",
  "Borlänge", "Bollnäs", "Enköping", "Eskilstuna", "Falun", "Falkenberg",
  "Helsingborg", "Halmstad", "Hudiksvall", "Handen", "Härnösand", "Jönköping",
  "Kristinehamn", "Kungsbacka", "Katrineholm", "Kristianstad", "Karlstad",
  "Karlskrona", "Kalmar", "Kungens Kurva", "Långsele", "Luleå", "Lund",
  "Linköping", "Ludvika", "Lidköping", "Mölndal", "Mora", "Mariehamn",
  "Malmö Svågertorp", "Mariestad", "Mjölby", "Nyköping", "Norrtälje", "Nacka",
  "Nässjö", "Norrköping", "Piteå", "Södertälje", "Stockholm City", "Skellefteå",
  "Skövde", "Sundsvall", "Trollhättan", "Täby", "Trelleborg", "Tanum", "Umeå",
  "Uppsala", "Uddevalla", "Upplands Väsby", "Vilhelmina", "Värnamo", "Varberg",
  "Växjö", "Västra Frölunda", "Västervik", "Värmdö", "Visby", "Valbo",
  "Västerås", "Ystad", "Åmål", "Ängelholm", "Örnsköldsvik", "Östersund", "Örebro",
];

const STORE_STATES: StoreState[] = ["i_lager", "pa_vag_in", "bestallningslage", "ej_tillganglig"];

// Mock-gatunamn typiska för Mios externhandelslägen. Härleds ur index för stabil prototyp.
const STORE_STREETS = [
  "Handelsvägen", "Industrigatan", "Köpmangatan", "Storgatan", "Verkstadsgatan",
  "Fabriksvägen", "Hantverksvägen", "Stationsvägen", "Centrumvägen", "Logistikvägen",
];

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/å|ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Deterministisk fördelning: mestadels i lager, en del på väg in / beställning,
// enstaka ej tillgänglig. Härleds ur index så prototypen är stabil mellan renders.
export const STORES: StoreInfo[] = STORE_CITIES.map((city, i) => {
  const bucket = i % 7;
  const state =
    bucket < 4 ? STORE_STATES[0] : bucket < 5 ? STORE_STATES[1] : bucket < 6 ? STORE_STATES[2] : STORE_STATES[3];
  return {
    id: slugify(city),
    name: `Mio ${city}`,
    area: city,
    address: `${STORE_STREETS[(i * 3) % STORE_STREETS.length]} ${1 + ((i * 7) % 89)}, ${city}`,
    distanceKm: 3 + ((i * 37) % 240),
    state,
    stockCount: state === "i_lager" ? 1 + ((i * 13) % 11) : 0,
  };
});

export const storeOptions: Record<ProductType, Option<StoreState>[]> = {
  snabb: [
    { id: "i_lager", label: "I lager" },
    { id: "pa_vag_in", label: "På väg in" },
    { id: "bestallningslage", label: "Beställningsläge" },
    { id: "ej_tillganglig", label: "Ej tillgänglig" },
  ],
  bestall: [
    { id: "i_lager", label: "I lager" },
    { id: "pa_vag_in", label: "På väg in" },
    { id: "bestallningslage", label: "Beställningsläge" },
    { id: "ej_tillganglig", label: "Ej tillgänglig" },
  ],
  lagervara: [
    { id: "i_lager", label: "I lager" },
    { id: "pa_vag_in", label: "På väg in" },
    { id: "bestallningslage", label: "Beställningsläge" },
    { id: "ej_tillganglig", label: "Ej tillgänglig" },
  ],
};

export const onlineOptions: Record<ProductType, Option<OnlineState>[]> = {
  snabb: [
    { id: "i_lager_cl", label: "I lager (CL/WL/DI)" },
    { id: "pa_vag_in", label: "På väg in online" },
    { id: "bestallningslage", label: "Beställningsläge online" },
    { id: "enbart_bl", label: "Enbart butikslager" },
    { id: "ej_tillganglig", label: "Ej tillgänglig" },
  ],
  bestall: [
    { id: "i_lager_cl", label: "I lager" },
    { id: "pa_vag_in", label: "På väg in online" },
    { id: "bestallningslage", label: "Beställningsläge online" },
    { id: "ej_tillganglig", label: "Ej tillgänglig" },
  ],
  // Online-rutan döljs alltid för lagervara; posten krävs bara av Record-typen.
  lagervara: [
    { id: "i_lager_cl", label: "I lager" },
    { id: "pa_vag_in", label: "På väg in online" },
    { id: "bestallningslage", label: "Beställningsläge online" },
    { id: "ej_tillganglig", label: "Ej tillgänglig" },
  ],
};

export type StoreListItem = {
  store: StoreInfo;
  status: CardStatus;
  // Visas bara för "på väg in" – datum då varan kan hämtas i butiken.
  pickupDate?: string;
};

// Panelen visar butiksnamn + lagerstatus per butik. Hämtning/hemleverans bor i
// rutorna (hemleverans är dessutom inte butiksberoende); endast "på väg in" får
// ett hämtdatum eftersom det är den status där datumet tillför något.
export function getStoreListItem(store: StoreInfo): StoreListItem {
  switch (store.state) {
    case "i_lager":
      return {
        store,
        status: { tone: "green", label: `${store.stockCount} st i lager` },
      };
    case "pa_vag_in":
      return {
        store,
        status: { tone: "amber", label: "På väg in" },
        pickupDate: "Hämta i butik från 15 maj",
      };
    case "bestallningslage":
      return {
        store,
        status: { tone: "neutral", label: "Beställningsvara, 4–8 veckor" },
      };
    case "ej_tillganglig":
      return {
        store,
        status: { tone: "gray", label: "Ej tillgänglig" },
      };
  }
}

export function getStoreList(): StoreListItem[] {
  return STORES.map((store) => getStoreListItem(store));
}

export function getStoreBox(
  state: StoreState,
  noStoreSelected: boolean,
  storeName: string,
  type: ProductType,
  onlineState: OnlineState,
  lagervaraInStores = false,
  lagervaraInSelectedStore = false,
  storeStockCount = 0,
  lagervaraStoreState: StoreState = "i_lager",
): BoxContent | null {
  // Lagervara = centrallager-saldo, ej kopplat till en specifik butik.
  // Visar antal i lager samt både butikshämtning och hemleverans.
  if (type === "lagervara") {
    // En lagervara kan ibland även finnas fysiskt i butiker. Då erbjuder vi samma
    // "Hämta direkt i X butiker"-länk som snabb/möbler, så kunden kan hämta direkt
    // i stället för att vänta på centrallager-leveransen. Länken öppnar butiksväljaren.
    // Utan vald butik finns ingen "egen" butik att jämföra mot – då heter länken
    // "Hämta direkt i N butiker"; med vald butik blir det "N andra butiker".
    const storePickupLink = lagervaraInStores
      ? noStoreSelected
        ? `Hämta direkt i ${OTHER_STORES_COUNT} butiker`
        : `Hämta direkt i ${OTHER_STORES_COUNT} andra butiker`
      : undefined;

    // Finns varan fysiskt i den valda butiken kan kunden hämta direkt (60 min) i stället för
    // att vänta på centrallager-leveransen. Då blir butiken den primära rutan och bär hela
    // leveranshistorien (hämtning + hemleverans); online visas som en kompletterande, strippad
    // "finns även online"-ruta ovanför (se getLagervaraOnlineBox). Gäller bara med vald butik.
    if (lagervaraInSelectedStore && !noStoreSelected) {
      // Butiken har varan i lager → butiksrutan är primär och bär hela leveranshistorien (hämtning
      // + hemleverans). Online visas då bara som strippat komplement (se getLagervaraOnlineBox).
      if (lagervaraStoreState === "i_lager") {
        return {
          rows: [
            { kind: "stock", text: `${storeStockCount} st i lager hos ${storeName}`, tone: "positive", action: "Byt butik" },
            { kind: "delivery", icon: "store", text: "Hämta gratis i butik inom 60 minuter" },
            { kind: "delivery", icon: "truck", text: "Hemleverans inom 3–9 dagar" },
          ],
          footerLink: storePickupLink,
        };
      }
      // Butiken har den INTE i lager (på väg in / beställning / slut): köpet går via online, som då
      // bär leveransen – butiksrutan döljs helt (return null). Saknas varan även online (state =
      // ej_tillganglig) finns inget att köpa någonstans → visa "slut" i stället för en tom vy.
      return state === "ej_tillganglig"
        ? { rows: [{ kind: "message", icon: "store", text: "Denna produkt är slut" }] }
        : null;
    }

    // Hämtning/hemleverans är butiksberoende ledtider. Utan vald butik kan vi inte säga
    // vad som gäller – då visar vi bara det butiksoberoende centrallagersaldot
    // (kommersiellt) plus en uppmaning där "Välj butik" är en inline-länk på samma rad
    // (samma mönster som "byt butik" på hämtraden). Tiderna "låses upp" när butik väljs;
    // med vald butik skriver vi ut butiksnamnet på hämtraden så tiden får sin kontext.
    // Butiksväljaren hänger alltså ihop med butiken, INTE saldot – annars läses antalet
    // som butikens eget lagersaldo. "Hämta direkt i …" ligger kvar längst ner i foten.
    const pickupPrompt: BoxRow = {
      kind: "message",
      icon: "store",
      action: "Välj butik",
      text: "för att se tider för hämtning och hemleverans",
    };

    switch (state) {
      case "i_lager":
        return {
          rows: [
            { kind: "stock", text: "Online: 24 st i lager", tone: "positive" },
            ...(noStoreSelected
              ? [pickupPrompt]
              : [
                  { kind: "delivery" as const, icon: "store" as const, text: `Hämta gratis hos ${storeName} inom 4 dagar`, action: "byt butik" },
                  { kind: "delivery" as const, icon: "truck" as const, text: "Hemleverans inom 3–9 dagar" },
                ]),
          ],
          footerLink: storePickupLink,
        };
      case "pa_vag_in":
        return {
          rows: [
            { kind: "eta", text: "På väg in" },
            ...(noStoreSelected
              ? [pickupPrompt]
              : [
                  { kind: "delivery" as const, icon: "store" as const, text: `Hämta gratis hos ${storeName} från 15 maj`, action: "byt butik" },
                  { kind: "delivery" as const, icon: "truck" as const, text: "Hemleverans inom 2–3 veckor" },
                ]),
          ],
          footerLink: storePickupLink,
        };
      case "bestallningslage":
        return {
          rows: [
            { kind: "eta", text: "Beställningsvara" },
            ...(noStoreSelected
              ? [pickupPrompt]
              : [
                  { kind: "delivery" as const, icon: "store" as const, text: `Hämta gratis hos ${storeName} inom 4–8 veckor`, action: "byt butik" },
                  { kind: "delivery" as const, icon: "truck" as const, text: "Hemleverans inom 4–8 veckor" },
                ]),
          ],
          footerLink: storePickupLink,
        };
      case "ej_tillganglig":
        // Slut i centrallager men kan finnas kvar i enstaka butiker: visa då butiks-
        // tillgängligheten i stället för "slut", med samma hämta-direkt-länk.
        return lagervaraInStores
          ? {
              rows: [
                { kind: "stock", text: `Finns i ${OTHER_STORES_COUNT} butiker`, tone: "positive" },
              ],
              footerLink: storePickupLink,
            }
          : {
              rows: [
                { kind: "message", icon: "store", text: "Denna produkt är slut" },
              ],
            };
    }
  }

  const inStockPickup = "Hämta gratis i butik inom 60 minuter";

  // Snabbrörlig kan hemlevereras även när online/ombud inte är tillgängligt
  // (slut eller enbart butikslager). Då bär butiksrutan hemleveransalternativet.
  const onlineUnavailable = onlineState === "ej_tillganglig" || onlineState === "enbart_bl";
  const snabbHomeDelivery: BoxRow[] =
    type === "snabb" && onlineUnavailable
      ? [{ kind: "delivery", icon: "truck", text: "Hemleverans inom 3–9 dagar" }]
      : [];

  if (noStoreSelected) {
    return {
      rows: [
        {
          kind: "stock",
          text: `Finns i lager i ${STORE_COUNT} butiker`,
          tone: "positive",
          action: "Välj butik",
        },
      ],
    };
  }

  switch (state) {
    case "i_lager":
      return {
        rows: [
          {
            kind: "stock",
            text: `4 st i lager hos ${storeName}`,
            tone: "positive",
            action: "Byt butik",
          },
          {
            kind: "delivery",
            icon: "store",
            text: inStockPickup,
          },
          ...(type === "bestall"
            ? [
                {
                  kind: "delivery" as const,
                  icon: "truck" as const,
                  text: "Hemleverans inom 3–9 dagar",
                },
              ]
            : []),
          ...snabbHomeDelivery,
        ],
      };
    case "pa_vag_in":
      return {
        rows: [
          {
            kind: "eta",
            text: `På väg till ${storeName}`,
            action: "Byt butik",
          },
          {
            kind: "delivery",
            icon: "store",
            text: "Hämta gratis i butik från 15 maj",
          },
          ...(type === "bestall"
            ? [
                {
                  kind: "delivery" as const,
                  icon: "truck" as const,
                  text: "Hemleverans inom 2–3 veckor",
                },
              ]
            : []),
        ],
        footerLink: `Hämta direkt i ${OTHER_STORES_COUNT} andra butiker`,
      };
    case "bestallningslage":
      return {
        rows: [
          {
            kind: "eta",
            text: `Beställningsvara hos ${storeName}`,
            action: "Byt butik",
          },
          {
            kind: "delivery",
            icon: "store",
            text: "Hämta gratis i butik inom 4–8 veckor",
          },
          ...(type === "bestall"
            ? [
                {
                  kind: "delivery" as const,
                  icon: "truck" as const,
                  text: "Hemleverans inom 4–8 veckor",
                },
              ]
            : []),
        ],
        footerLink: `Hämta direkt i ${OTHER_STORES_COUNT} andra butiker`,
      };
    case "ej_tillganglig":
      // Ingen hemlevererans här: snabbrörlig hemleverans fullföljs från butikssaldot,
      // och är butiken ej tillgänglig finns inget att skicka.
      return {
        rows: [
          {
            kind: "message",
            icon: "store",
            text: "Denna produkt går inte att köpa ifrån butik",
          },
        ],
      };
  }
}

export function getOnlineBox(
  state: OnlineState,
  type: ProductType,
  noStoreSelected: boolean,
): BoxContent | null {
  // Lagervara har ingen separat online-ruta – dess enda ruta ÄR centrallagersaldot.
  if (type === "lagervara") {
    return null;
  }

  // Möbler (större) säljs via butikslager och har ingen onlinekanal – då visas ingen
  // online-ruta alls. Hämtning/hemleverans bor i butiksrutan.
  if (type === "bestall") {
    return null;
  }

  // Online levereras till ombud (paket). Priset bakas in i texten (jfr "Hämta gratis i butik …")
  // istället för en separat prislapp.
  // Leveranstider beror på leveransadress (likt butiksrutans hämt-/hemleverans). Utan
  // vald butik döljer vi därför leveransraderna och visar bara lagerstatusen online.
  switch (state) {
    case "i_lager_cl":
      return {
        rows: [
          {
            kind: "stock",
            text: "Online: 100 st i lager",
            tone: "positive",
          },
          ...(noStoreSelected
            ? []
            : [
                {
                  kind: "delivery" as const,
                  icon: "package" as const,
                  text: "Levereras inom 2–5 dagar, från 49 kr",
                },
              ]),
        ],
      };
    case "pa_vag_in":
      return {
        rows: [
          {
            kind: "eta",
            text: "På väg in online",
          },
          ...(noStoreSelected
            ? []
            : [
                {
                  kind: "delivery" as const,
                  icon: "package" as const,
                  text: "Levereras inom 2–3 veckor, från 49 kr",
                },
              ]),
        ],
      };
    case "bestallningslage":
      return {
        rows: [
          {
            kind: "eta",
            text: "Beställningsvara online",
          },
          ...(noStoreSelected
            ? []
            : [
                {
                  kind: "delivery" as const,
                  icon: "package" as const,
                  text: "Levereras inom 4–8 veckor, från 49 kr",
                },
              ]),
        ],
      };
    // Saknas ombudskanal (enbart butikslager eller helt slut) visas ingen online-ruta –
    // hämtning/hemleverans (snabbrörligt) bor kvar i butiksrutan.
    case "enbart_bl":
      return null;
    case "ej_tillganglig":
      return null;
  }
}

// Online-ruta för lagervara i "finns i vald butik"-läget. Har butiken varan i lager fungerar den
// som ett KOMPLEMENT ("finns i butik – dessutom fler online") och visas strippad, utan leveransrad
// (butiksrutan bär leveransen). Har butiken den INTE i lager (på väg in / beställning / slut) går
// köpet via online och då bär online-rutan leveransen: hämta i butik OCH hemleverans. Båda matar
// från onlinelagret, så tiderna följer online-statusen – hämtning i butik går snabbt (online→butik,
// ~3 dagar) när online finns i lager, oavsett butikens egen påfyllning. Utan vald butik: ingen ruta.
export function getLagervaraOnlineBox(
  onlineState: StoreState,
  storeOwnState: StoreState,
  storeName: string,
  lagervaraInSelectedStore: boolean,
  noStoreSelected: boolean,
): BoxContent | null {
  if (!lagervaraInSelectedStore || noStoreSelected || onlineState === "ej_tillganglig") return null;

  // Lead-rad = online-statusen.
  const lead: BoxRow =
    onlineState === "i_lager"
      ? { kind: "stock", text: "Online: 24 st i lager", tone: "positive" }
      : { kind: "eta", text: onlineState === "pa_vag_in" ? "På väg in online" : "Beställningsvara online" };

  // Butiken har varan i lager → strippat komplement, butiksrutan bär leveransen.
  if (storeOwnState === "i_lager") return { rows: [lead] };

  // Butiken har den inte i lager → online bär leveransen. Både hämtning och hemleverans matar från
  // onlinelagret, så tiderna följer online-statusen; hämtning i butik (online→butik) är snabb.
  const pickupTiming =
    onlineState === "i_lager" ? "inom 3 dagar" : onlineState === "pa_vag_in" ? "inom 2–3 veckor" : "inom 4–8 veckor";
  const homeTiming =
    onlineState === "i_lager" ? "inom 3–9 dagar" : onlineState === "pa_vag_in" ? "inom 2–3 veckor" : "inom 4–8 veckor";

  return {
    rows: [
      lead,
      { kind: "delivery", icon: "store", text: `Hämta gratis hos ${storeName} ${pickupTiming}`, action: "byt butik" },
      { kind: "delivery", icon: "truck", text: `Hemleverans ${homeTiming}` },
    ],
  };
}

// --- Lagervara: en enad ruta -----------------------------------------------
// Lagervara säljs alltid via butik (även hemleveransen routas dit), så kanal-
// uppdelningen online/butik tas bort. I stället en enda ruta med FASTA rader vars
// innehåll byts mellan tillstånd – inga rader tillkommer eller faller bort, så
// layouten står still (ingen "hoppighet" beroende på butiksval). Raderna:
//   1. butiksstatus · 2. onlinestatus · 3. hämta i butik · 4. hemleverans från butik
// Rad 1–2 visar "i lager" som grön prick och på väg in / beställningsläge som klock-rad,
// med samma wording som de andra rutorna (getStoreBox / getOnlineBox).
export function getLagervaraBox(params: {
  noStoreSelected: boolean;
  storeName: string;
  // Centrallagrets (online) status – finns oavsett butiksval och bär leveranstiderna.
  onlineState: StoreState;
  // Den valda butikens egen status (i lager → 60 min; på väg in → satt datum; beställning/slut
  // → varan tas dit via centrallager). "Ej tillgänglig" = butiken för inte varan själv.
  storeShelfState: StoreState;
  storeStockCount: number;
  // Finns kvar i enstaka andra butiker → "Hämta direkt i N …"-länk i foten.
  inOtherStores: boolean;
}): BoxContent {
  const { noStoreSelected, storeName, onlineState, storeShelfState, storeStockCount, inOtherStores } = params;

  // Hämta-direkt-länken i foten pekar på ANDRA butiker än den valda – meningslös utan vald
  // butik (då bär rad 1 + "Välj butik" den rollen i stället).
  const otherStoresLink = inOtherStores && !noStoreSelected ? `Hämta direkt i ${OTHER_STORES_COUNT} andra butiker` : undefined;

  // Butiksväljaren hänger på rad 1: utan vald butik "Välj butik", med vald butik "Byt butik".
  const storeAction = noStoreSelected ? "Välj butik" : "Byt butik";

  // Lagervara fylls normalt från centrallagret (online), så det är oftast ONLINE-statusen som
  // styr när varan kan tas till butik. Butikens egen status spelar in i två fall:
  //   - står den på hyllan just nu (i lager) → hämtning inom 60 min.
  //   - har butiken en egen inkommande leverans (på väg in, satt datum) som slår en långsam
  //     online-väg → visa den i stället för "Beställs till"-scenariot (corner case).
  const inStoreNow = !noStoreSelected && storeShelfState === "i_lager";
  const storeIncoming = !noStoreSelected && storeShelfState === "pa_vag_in";
  const storeOrder = !noStoreSelected && storeShelfState === "bestallningslage";
  // Butikens egen kanal (inkommande leverans med satt datum, eller beställningsvara) tar över
  // rad 1 + tiderna när onlinevägen är minst lika långsam (online beställningsvara) eller slut –
  // då är "Beställs till" missvisande och butikens status (klocka) blir tydligare/ärligare.
  const onlineSlowOrGone = onlineState === "bestallningslage" || onlineState === "ej_tillganglig";
  const useStoreIncoming = storeIncoming && onlineSlowOrGone;
  const useStoreOrder = storeOrder && onlineSlowOrGone;

  // Inget online, inte på hyllan OCH ingen egen butikskanal (inkommande/beställning) → kan inte
  // tas via centrallager → butik. Finns den kvar i andra butiker pekar vi dit, annars helt slut.
  // (Genuint annan situation – att den ser annorlunda ut än köpflödet är ok.)
  if (onlineState === "ej_tillganglig" && !inStoreNow && !storeIncoming && !storeOrder) {
    return inOtherStores
      ? { rows: [{ kind: "stock", text: `Finns i ${OTHER_STORES_COUNT} butiker`, tone: "positive", action: storeAction }] }
      : { rows: [{ kind: "message", icon: "store", text: "Denna produkt är slut" }] };
  }

  // Rad 1 – butik.
  // - På hyllan i vald butik → saldot ("X st i lager hos …"), grön prick.
  // - Egen inkommande leverans som slår onlinevägen → "På väg till <butik>" (klocka).
  // - Egen beställningsvara när onlinevägen är lika långsam/slut → "Beställningsvara hos <butik>"
  //   (klocka) – ärligare än "Beställs till" när det i praktiken är ett 4–8-veckors orderläge.
  // - Ingen butik vald men finns fysiskt i butiker → "Finns i N butiker" (starkaste positiva).
  // - Annars → varan beställs till butik via centrallager. Texten hålls KONSTANT ("Beställs till
  //   <butik>" / "Beställs till butik", grön prick) så åtgärden är tydlig; väntan lever på rad 2.
  //   "Finns inte hos …" undviks – det läser ickekommersiellt fast varan går att få.
  let storeRow: BoxRow;
  if (inStoreNow) {
    storeRow = { kind: "stock", text: `${storeStockCount} st i lager hos ${storeName}`, tone: "positive", action: storeAction };
  } else if (useStoreIncoming) {
    storeRow = { kind: "eta", text: `På väg till ${storeName}`, action: storeAction };
  } else if (useStoreOrder) {
    storeRow = { kind: "eta", text: `Beställningsvara hos ${storeName}`, action: storeAction };
  } else if (noStoreSelected && inOtherStores) {
    storeRow = { kind: "stock", text: `Finns i ${OTHER_STORES_COUNT} butiker`, tone: "positive", action: storeAction };
  } else {
    storeRow = { kind: "stock", text: noStoreSelected ? "Beställs till butik" : `Beställs till ${storeName}`, tone: "positive", action: storeAction };
  }

  // Rad 2 – online/centrallager. Wording speglar getOnlineBox: i lager = prick-saldo, på väg in /
  // beställningsläge = klock-rad ("På väg in online" / "Beställningsvara online"), slut = dämpat.
  let onlineRow: BoxRow;
  if (onlineState === "i_lager") {
    onlineRow = { kind: "stock", text: "Online: 100+ st i lager", tone: "positive" };
  } else if (onlineState === "pa_vag_in") {
    onlineRow = { kind: "eta", text: "På väg in online" };
  } else if (onlineState === "bestallningslage") {
    onlineRow = { kind: "eta", text: "Beställningsvara online" };
  } else {
    onlineRow = { kind: "stock", text: "Slutsåld online", tone: "muted" };
  }

  // Utan vald butik kan vi inte ange hämt-/hemleveranstider (de är butiksberoende) → ersätt de
  // raderna med en info-box som uppmanar till butiksval. Saldoraderna (1–2) ligger kvar.
  if (noStoreSelected) {
    return {
      rows: [storeRow, onlineRow, { kind: "notice", text: "Välj butik för att se tider för hämtning och hemleverans." }],
    };
  }

  // Rad 3 (hämta i butik) + rad 4 (hemleverans från butik). På hyllan → hämta 60 min, hemleverans
  // 3–5 dagar. Annars kommer varan via centrallager → butik och tiderna följer online-statusen.
  // Leveransen routas alltid via butik, vilket skrivs ut ("från butik") för tydlighet.
  let pickupTiming: string;
  let homeTiming: string;
  if (inStoreNow) {
    pickupTiming = "inom 60 minuter";
    homeTiming = "inom 3–5 dagar";
  } else if (useStoreIncoming) {
    // Butikens egen inkommande leverans har ett satt datum → hämtraden visar datumet
    // ("från 15 maj"), hemleverans intervallet – precis som getStoreBox vid på väg in.
    pickupTiming = "från 15 maj";
    homeTiming = "inom 2–3 veckor";
  } else if (useStoreOrder) {
    // Butikens egen beställningsvara → 4–8 veckor på båda raderna.
    pickupTiming = "inom 4–8 veckor";
    homeTiming = "inom 4–8 veckor";
    // På väg in online = satt ankomstdatum (centrallager → butik), så hämtraden visar datumet.
  } else {
    pickupTiming =
      onlineState === "pa_vag_in" ? "från 15 maj" : onlineState === "bestallningslage" ? "inom 4–8 veckor" : "inom 3–5 dagar";
    homeTiming =
      onlineState === "pa_vag_in" ? "inom 2–3 veckor" : onlineState === "bestallningslage" ? "inom 4–8 veckor" : "inom 5–9 vardagar";
  }
  const pickupRow: BoxRow = { kind: "delivery", icon: "store", text: `Hämta gratis i butik ${pickupTiming}` };
  const homeRow: BoxRow = { kind: "delivery", icon: "truck", text: `Hemleverans från butik ${homeTiming}` };

  return { rows: [storeRow, onlineRow, pickupRow, homeRow], footerLink: otherStoresLink };
}

export function getCardStatus(
  storeState: StoreState,
  onlineState: OnlineState,
  noStoreSelected: boolean,
  type: ProductType,
): CardStatus {
  const storeInStock = storeState === "i_lager";
  const onlineInStock = onlineState === "i_lager_cl";
  const storeIncoming = storeState === "pa_vag_in";
  const onlineIncoming = onlineState === "pa_vag_in";
  const storeOrder = storeState === "bestallningslage";
  const onlineOrder = onlineState === "bestallningslage";
  const onlineUnavailable = onlineState === "ej_tillganglig";

  if (noStoreSelected) {
    if (onlineInStock) return { tone: "green", label: "Finns i lager" };
    if (onlineIncoming) return { tone: "amber", label: "På väg in" };
    if (onlineOrder) {
      return {
        tone: "neutral",
        label: "Beställningsvara",
        sublabel: type === "bestall" ? "4–8 v" : undefined,
      };
    }
    if (onlineUnavailable) return { tone: "gray", label: "Ej tillgänglig online" };
    return { tone: "green", label: `Finns i ${STORE_COUNT} butiker` };
  }

  if (storeInStock || onlineInStock) return { tone: "green", label: "Finns i lager" };
  if (storeIncoming || onlineIncoming) return { tone: "amber", label: "På väg in" };
  if (storeOrder || onlineOrder) {
    return {
      tone: "neutral",
      label: "Beställningsvara",
      sublabel: type === "bestall" ? "4–8 v" : undefined,
    };
  }
  if (type === "bestall" && storeState !== "ej_tillganglig") {
    return { tone: "neutral", label: "Beställningsvara", sublabel: "4–8 v" };
  }
  return { tone: "gray", label: "Tillfälligt slut" };
}

export function getScenarioLabel(
  type: ProductType,
  storeState: StoreState,
  onlineState: OnlineState,
  noStoreSelected: boolean,
): string {
  const typeLabel =
    type === "snabb" ? "Snabbrörlig" : type === "lagervara" ? "Lagervara" : "Möbler (större)";
  const storeLabel = noStoreSelected
    ? "Ingen butik vald"
    : getOptionLabel(storeState, storeOptions[type]);
  const onlineLabel =
    type === "lagervara"
      ? "Döljs (via butik)"
      : type === "bestall" && !noStoreSelected
      ? "Döljs (BL-driven)"
      : getOptionLabel(onlineState, onlineOptions[type]);

  return `${typeLabel} · Butik: ${storeLabel} · Online: ${onlineLabel}`;
}

function getOptionLabel<T extends string>(id: T, options: Option<T>[]) {
  return options.find((option) => option.id === id)?.label ?? id;
}
