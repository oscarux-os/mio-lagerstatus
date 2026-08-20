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

// Lagervarans BUTIKSSTATUS beskriver bara det butiksspecifika: hyllsaldo, en inleverans på väg
// eller ingetdera. Beställningsläge saknas medvetet – för en lagervara ÄR butikens beställnings-
// kanal centrallagrets (butiken lägger ingen egen leverantörsorder, det gör bara möbler), så det
// läget bor på online-/CL-statusen. Att utesluta det i typen gör kombinationen "slut online men
// beställningsbar i butik" omöjlig att representera i stället för bara osannolik att visa.
export type LagervaraStoreState = Exclude<StoreState, "bestallningslage">;

// Butiksväljarens mock-status gäller alla produkttyper. För en lagervara betyder en butik i
// beställningsläge att butiken inte för varan själv – den tas dit via centrallagret.
export function toLagervaraStoreState(state: StoreState): LagervaraStoreState {
  return state === "bestallningslage" ? "ej_tillganglig" : state;
}

// Centrallagrets saldo i prototypen (mock). Visas bara när varan är slut i den valda butiken –
// se rad 2 i getLagervaraBox.
const CENTRAL_STOCK = "100+ st";

export type Option<T extends string> = {
  id: T;
  label: string;
};

export type BoxRow =
  | {
      kind: "stock";
      text: string;
      // positive = grön prick, finns på hyllan att hämta nu.
      // warning  = guldprick i vanlig textfärg: varan är inte här just nu men läget går över, och
      //            raden bär ett besked kunden ska läsa (inte tona bort) – "Tillfälligt slut hos X".
      // muted    = nedtonad prick och nedtonad text, för det som faktiskt är ett nej utan åtgärd.
      tone: "positive" | "warning" | "muted";
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
      // Fylld info-box (ljusblå) med info-ikon, t.ex. uppmaningen att välja butik för att
      // se hämt-/hemleveranstider. Ingen inline-länk.
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
// Butiker med en redan lagd inleverans på väg in. Eget antal – det är sällan samma butiker som
// har varan på hyllan just nu.
export const INCOMING_STORES_COUNT = 3;

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
  // OBS: för lagervara driver den här listan ONLINE-/centrallagerstatusen (dess butiksruta har
  // ingen egen kanal). Butiksstatusen har en egen, kortare lista – se lagervaraStoreOptions.
  lagervara: [
    { id: "i_lager", label: "I lager" },
    { id: "pa_vag_in", label: "På väg in" },
    { id: "bestallningslage", label: "Beställningsläge" },
    { id: "ej_tillganglig", label: "Ej tillgänglig" },
  ],
};

// Lagervarans butiksstatus – utan beställningsläge, se LagervaraStoreState.
export const lagervaraStoreOptions: Option<LagervaraStoreState>[] = [
  { id: "i_lager", label: "I lager" },
  { id: "pa_vag_in", label: "På väg in" },
  { id: "ej_tillganglig", label: "Ej tillgänglig" },
];

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
  // Vissa snabbrörliga produkter går inte att skicka till ombud alls (t.ex. skrymmande
  // eller ömtåliga varor) – oberoende av lagerstatusen. Kunder har missuppfattat detta
  // som att ombud ändå erbjuds (så som snabbrörligt normalt fungerar), så när flaggan är
  // false ersätts leveransraden med en tydlig info-box i stället för paketleverans.
  ombudAvailable = true,
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

  const noOmbudNotice: BoxRow = {
    kind: "notice",
    text: "Denna produkt levereras inte till ombud.",
  };

  // Online levereras till ombud (paket). Priset bakas in i texten (jfr "Hämta gratis i butik …")
  // istället för en separat prislapp.
  // Leveranstider beror på leveransadress (likt butiksrutans hämt-/hemleverans). Utan
  // vald butik döljer vi därför leveransraderna och visar bara lagerstatusen online.
  // Går produkten inte via ombud visas info-boxen ändå, oavsett butiksval – det är en
  // egenskap hos produkten, inte en leveranstid som beror på adress.
  switch (state) {
    case "i_lager_cl":
      return {
        rows: [
          {
            kind: "stock",
            text: "Online: 100 st i lager",
            tone: "positive",
          },
          ...(!ombudAvailable
            ? [noOmbudNotice]
            : noStoreSelected
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
          ...(!ombudAvailable
            ? [noOmbudNotice]
            : noStoreSelected
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
          ...(!ombudAvailable
            ? [noOmbudNotice]
            : noStoreSelected
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
// Rad 1–2 visar "i lager" (finns på hyllan att hämta) som grön prick, och allt som ännu inte är
// på plats – på väg in, beställningsläge, beställs till butik via centrallager – som klock-rad,
// med samma wording som de andra rutorna (getStoreBox / getOnlineBox).
export function getLagervaraBox(params: {
  noStoreSelected: boolean;
  storeName: string;
  // Centrallagrets (online) status – finns oavsett butiksval och bär leveranstiderna.
  onlineState: StoreState;
  // Den valda butikens egen status (i lager → 60 min; på väg in → satt datum; slut → varan tas
  // dit via centrallager). "Ej tillgänglig" = butiken för inte varan själv. Beställningsläge
  // finns inte här – det är centrallagrets kanal, se LagervaraStoreState.
  storeShelfState: LagervaraStoreState;
  storeStockCount: number;
  // Finns kvar på hyllan i enstaka andra butiker → "Hämta direkt i N …"-länk i foten.
  inOtherStores: boolean;
  // Redan lagda inleveranser är på väg in till enstaka butiker. Skilt från inOtherStores: varan
  // står inte på någon hylla ännu, men landar på ett datum – det är det enda som kan rädda köpet
  // när centrallagret är helt slut.
  incomingInOtherStores: boolean;
}): BoxContent {
  const { noStoreSelected, storeName, onlineState, storeShelfState, storeStockCount, inOtherStores, incomingInOtherStores } = params;
  // Mottagaren för "beställs till …" – butiksnamnet när ett val finns, annars generiskt.
  const orderTarget = noStoreSelected ? "butik" : storeName;

  // Hämta-direkt-länken i foten pekar på ANDRA butiker än den valda – meningslös utan vald
  // butik (då bär rad 1 + "Välj butik" den rollen i stället).
  const otherStoresLink = inOtherStores && !noStoreSelected ? `Hämta direkt i ${OTHER_STORES_COUNT} andra butiker` : undefined;

  // Butiksväljaren hänger på rad 1: utan vald butik "Välj butik", med vald butik "Byt butik".
  const storeAction = noStoreSelected ? "Välj butik" : "Byt butik";

  // Lagervara fylls från centrallagret (online), så det är ONLINE-statusen som styr när varan
  // kan tas till butik – inklusive beställningsläget, som är CL:s kanal. Butikens egen status
  // är rent butiksspecifik och spelar in i två fall:
  //   - står den på hyllan just nu (i lager) → hämtning inom 60 min.
  //   - har butiken en egen inkommande leverans (på väg in, satt datum) som slår en långsam
  //     online-väg → visa den i stället för "Beställs till"-scenariot (corner case).
  // Båda svarar på frågor om en specifik butik ("hur många står på hyllan hos X", "vilket datum
  // landar leveransen hos X") och saknar därför mening utan vald butik.
  const inStoreNow = !noStoreSelected && storeShelfState === "i_lager";
  const storeIncoming = !noStoreSelected && storeShelfState === "pa_vag_in";
  // Butikens egen inleverans (satt datum) tar över rad 1 + tiderna när onlinevägen är minst lika
  // långsam (online beställningsvara) eller slut – då är "Beställs till" missvisande och butikens
  // status (klocka) blir tydligare/ärligare.
  const onlineSlowOrGone = onlineState === "bestallningslage" || onlineState === "ej_tillganglig";
  const useStoreIncoming = storeIncoming && onlineSlowOrGone;

  // Slut i centrallagret = ingen påfyllning alls (utgången vara) – annars hade den stått i
  // beställningsläge. Då finns ingen väg CL → butik, och det enda som kan rädda köpet är det
  // butiksspecifika: hyllsaldo eller en redan lagd inleverans. Saknas även det är varan slut;
  // finns den kvar i andra butiker pekar vi dit.
  // (Genuint annan situation – att den ser annorlunda ut än köpflödet är ok.)
  const noCentralWarehousePath = onlineState === "ej_tillganglig" && !inStoreNow && !storeIncoming;
  // Undantag: utan vald butik VET vi inte om varan går att få – vi vet bara att den finns kvar
  // fysiskt i, eller är på väg in till, några butiker. Det är ett obesvarat läge, inte ett
  // slut-läge, så det ska behålla den vanliga radstrukturen (butik · online · uppmaning) i
  // stället för att kollapsa till en ensam rad. Skillnaden bärs av info-boxen nedan: där svarar
  // butiksvalet på var/när varan finns, inte på "vilka tider gäller?" – det finns ingen
  // centrallagerväg att tidsätta.
  const unresolvedWithoutStore = noStoreSelected && (inOtherStores || incomingInOtherStores);
  if (noCentralWarehousePath && !unresolvedWithoutStore) {
    // Hyllsaldo (hämta direkt) slår inleverans (vänta till ett datum) slår slut.
    if (inOtherStores) {
      return { rows: [{ kind: "stock", text: `Finns i ${OTHER_STORES_COUNT} butiker`, tone: "positive", action: storeAction }] };
    }
    if (incomingInOtherStores) {
      // Datumet utelämnas medvetet: inleveranserna landar olika dag i olika butiker, så ett
      // gemensamt datum vore påhittat. Butiksvalet är det som ger ett skarpt datum.
      return { rows: [{ kind: "eta", text: `På väg in till ${INCOMING_STORES_COUNT} butiker`, action: storeAction }] };
    }
    return { rows: [{ kind: "message", icon: "store", text: "Denna produkt är slut" }] };
  }

  // Rad 1 – butik.
  // - På hyllan i vald butik → saldot ("X st i lager hos …"), grön prick.
  // - Egen inkommande leverans som slår onlinevägen → "På väg till <butik>" (klocka).
  // - Ingen butik vald men finns fysiskt i butiker → "Finns i N butiker" (starkaste positiva).
  // - Ingen butik vald, inget hyllsaldo men inleveranser på väg och en långsam/slut onlineväg →
  //   "På väg in till N butiker" (klocka). Samma regel som useStoreIncoming, fast aggregerad:
  //   butikernas egen inleverans får ta rad 1 bara när den faktiskt slår centrallagervägen.
  // - Vald butik utan hyllsaldo → "Tillfälligt slut hos <butik>" (nedtonad prick). Butiksraden
  //   säger det butiksspecifika, som den ska, och rad 2 bär beställningsvägen med centrallagrets
  //   antal. "Tillfälligt" är nyckeln: det är ett läge som går över, inte ett nej – och det tar
  //   bort tvetydigheten som fanns när rutan bara sa att varan gick att beställa hit (stod den
  //   på hyllan också?). "Finns inte hos …" undviks fortfarande, det läser som ett nej.
  // - Utan vald butik → centrallagerbeskedet, KONSTANT ("Går att beställa till butik", klocka).
  //   Inget antal här: utan butik finns inget "slut hos X" att kontrastera det mot.
  const useIncomingStores = noStoreSelected && !inOtherStores && incomingInOtherStores && onlineSlowOrGone;
  // Sant när rad 1 bär centrallagrets besked i stället för ett butiksspecifikt – då ska rad 2
  // inte upprepa samma sak.
  let storeRowIsCentral = false;
  // Sant när rad 1 säger att varan är slut i den valda butiken – då är rad 2 svaret på det, och
  // bara då bär den centrallagrets antal.
  let storeSoldOut = false;
  let storeRow: BoxRow;
  if (inStoreNow) {
    storeRow = { kind: "stock", text: `${storeStockCount} st i lager hos ${storeName}`, tone: "positive", action: storeAction };
  } else if (useStoreIncoming) {
    storeRow = { kind: "eta", text: `På väg till ${storeName}`, action: storeAction };
  } else if (noStoreSelected && inOtherStores) {
    storeRow = { kind: "stock", text: `Finns i ${OTHER_STORES_COUNT} butiker`, tone: "positive", action: storeAction };
  } else if (useIncomingStores) {
    storeRow = { kind: "eta", text: `På väg in till ${INCOMING_STORES_COUNT} butiker`, action: storeAction };
  } else if (!noStoreSelected) {
    // Varan är slut i den valda butiken. Det beskedet får rad 1 – guldprick i vanlig textfärg, inte
    // nedtonat: raden är själva svaret på "finns den i min butik?" och ska läsas, inte tonas bort.
    // Nedtoning är reserverad för det som är ett nej utan åtgärd ("Går inte att beställa till
    // butik"); här går varan att få, den står bara inte på hyllan i dag.
    // Centrallagret tar rad 2 i stället för att trängas här. Den som ändå
    // vill hämta samma dag har "Byt butik" på raden och "Hämta direkt i N andra butiker" i foten.
    storeSoldOut = true;
    storeRow = { kind: "stock", text: `Tillfälligt slut hos ${storeName}`, tone: "warning", action: storeAction };
  } else {
    // Ingen butik vald → rad 1 ÄR centrallagerbeskedet: "Går att beställa till butik". KONSTANT
    // över centrallagrets alla lägen; väntan bor i klockan och i hämt-/hemleveransraderna, där
    // den ändå måste tidsättas.
    // Inget antal här. Antalet är trygghet EFTER ett negativt besked ("tillfälligt slut hos Mio X
    // – men 100+ st går att beställa hit"), och utan vald butik finns inget sådant besked att
    // trösta. Kvar blir bara en lång rad med ett tresiffrigt lagersaldo som läses som butikens.
    // "Går att beställa" hellre än "Beställs till": med klocka framför läser "Beställs till Mio X"
    // som att en order redan är lagd (jfr "På väg till Mio X"). Verbformen säger att det är
    // kunden som kan göra det, och delar vokabulär med rad 2.
    // Ikonen är en KLOCKA, inte en grön prick: varan står inte i butiken nu, den tas dit – samma
    // "kommer, men inte än"-läge som när en vara är på väg in till en butik, och därför samma
    // ikon. Den gröna pricken är reserverad för det som faktiskt finns på hyllan att hämta;
    // användes den även här läste kunden beställningsläget som närvaro i butiken.
    storeRowIsCentral = true;
    storeRow = { kind: "eta", text: `Går att beställa till ${orderTarget}`, action: storeAction };
  }

  // Rad 2 – centrallagret. Svarar på "kan den beställas hit?" i stället för att rapportera en
  // kanal: ordet "Online" återinförde precis den kanaluppdelning som den enade rutan skulle ta
  // bort (en lagervara har ingen onlinekanal – allt går via butik), och "Online: 100+ st i lager"
  // bredvid beställningsraden gav två gröna prickar där saldot vann över verbet i en
  // skumläsning. Det var därför kunder inte kunde avgöra om varan fanns i butiken.
  // Raden visas bara när den säger något rad 1 inte redan säger. Är rad 1 redan centrallager-
  // beskedet vore den en upprepning. Och står varan på hyllan är kundens fråga besvarad – då blir
  // en andra rad bara något att snubbla på, vilket var precis mönstret som gjorde att kunder inte
  // kunde avgöra om varan fanns i butiken. Antalet på hyllan spelar ingen roll för den
  // bedömningen: en tröskel som visade "fler går att beställa" vid knappt saldo lade tillbaka en
  // andra rad i det läge där rad 1 redan var som starkast, och gjorde rutan olika hög beroende på
  // vilken butik som råkade vara vald.
  // Har den valda butiken en egen väg – varan står på hyllan, eller en inleverans är på väg dit –
  // utelämnas det NEGATIVA beskedet helt. Att varan inte går att beställa är då ett nedslående
  // besked utan åtgärd: kunden kan ju hämta den. De positiva beskeden ("går att beställa …")
  // står kvar, för de erbjuder en väg till varan. Utan vald butik står även det negativa
  // kvar – där förklarar det varför enstaka butiker är enda vägen.
  const storeHasOwnPath = inStoreNow || useStoreIncoming;
  let onlineRow: BoxRow | null;
  if (storeRowIsCentral || inStoreNow) {
    onlineRow = null;
  } else if (onlineState === "ej_tillganglig" && storeHasOwnPath) {
    onlineRow = null;
  } else if (onlineState === "i_lager") {
    // Klocka, inte grön prick: det här är beställningsvägen, inte hyllsaldo.
    // Antalet visas bara när rad 1 sa att varan är slut i den valda butiken. Där är det trygghet
    // som besvarar ett nej: "tillfälligt slut hos Mio X" följt av "100+ st går att beställa till
    // butik" säger att väntan handlar om transport, inte om att varan kan tas ifrån en. Utan ett
    // sådant nej framför sig är antalet bara ett tresiffrigt lagersaldo som läses som butikens.
    onlineRow = {
      kind: "eta",
      text: storeSoldOut ? `${CENTRAL_STOCK} går att beställa till butik` : "Går att beställa till butik",
    };
  } else if (onlineState === "pa_vag_in") {
    onlineRow = { kind: "eta", text: "Går att beställa till butik från 15 maj" };
  } else if (onlineState === "bestallningslage") {
    onlineRow = { kind: "eta", text: "Går att beställa till butik, 4–8 veckor" };
  } else {
    onlineRow = { kind: "stock", text: "Går inte att beställa till butik", tone: "muted" };
  }

  // Utan vald butik kan vi inte ange hämt-/hemleveranstider (de är butiksberoende) → ersätt de
  // raderna med en info-box som uppmanar till butiksval. Saldoraderna (1–2) ligger kvar.
  // Saknas centrallagervägen (enda spåret är enstaka butiker) är det inte tiderna som är okända
  // utan om varan över huvud taget finns i just den butiken – då lovar vi inga tider, utan säger
  // vad valet faktiskt svarar på. Frågan skiljer sig åt mellan de två spåren: restsaldo svarar
  // "finns den kvar?", inleverans svarar "när kommer den?". Löftesnivån följer alltså vad vi vet,
  // inte en fast textmall.
  if (noStoreSelected) {
    let noticeText = "Välj butik för att se tider för hämtning och hemleverans.";
    if (noCentralWarehousePath) {
      noticeText = inOtherStores
        ? "Välj butik för att se om varan finns kvar där."
        : "Välj butik för att se när varan kommer dit.";
    }
    return { rows: [storeRow, ...(onlineRow ? [onlineRow] : []), { kind: "notice", text: noticeText }] };
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
    // På väg in online = satt ankomstdatum (centrallager → butik), så hämtraden visar datumet.
    // Beställningsläge online = CL:s leverantörsorder, 4–8 veckor på båda raderna.
  } else {
    pickupTiming =
      onlineState === "pa_vag_in" ? "från 15 maj" : onlineState === "bestallningslage" ? "inom 4–8 veckor" : "inom 3–5 dagar";
    homeTiming =
      onlineState === "pa_vag_in" ? "inom 2–3 veckor" : onlineState === "bestallningslage" ? "inom 4–8 veckor" : "inom 5–9 vardagar";
  }
  const pickupRow: BoxRow = { kind: "delivery", icon: "store", text: `Hämta gratis i butik ${pickupTiming}` };
  const homeRow: BoxRow = { kind: "delivery", icon: "truck", text: `Hemleverans från butik ${homeTiming}` };

  return { rows: [storeRow, ...(onlineRow ? [onlineRow] : []), pickupRow, homeRow], footerLink: otherStoresLink };
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
