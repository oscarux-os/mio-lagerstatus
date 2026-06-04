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
    }
  | {
      kind: "message";
      icon: "store" | "truck" | "package";
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
        status: { tone: "neutral", label: "Beställningsvara", sublabel: "4–8 v" },
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
  type: ProductType,
  onlineState: OnlineState,
): BoxContent {
  // Lagervara = centrallager-saldo, ej kopplat till en specifik butik.
  // Visar antal i lager samt både butikshämtning och hemleverans.
  if (type === "lagervara") {
    switch (state) {
      case "i_lager":
        return {
          rows: [
            { kind: "stock", text: "Online: 24 st i lager", tone: "positive" },
            { kind: "delivery", icon: "store", text: "Hämta gratis i butik inom 4 dagar" },
            { kind: "delivery", icon: "truck", text: "Hemleverans inom 3–9 dagar" },
          ],
        };
      case "pa_vag_in":
        return {
          rows: [
            { kind: "eta", text: "På väg in" },
            { kind: "delivery", icon: "store", text: "Hämta gratis i butik från 15 maj" },
            { kind: "delivery", icon: "truck", text: "Hemleverans inom 2–3 veckor" },
          ],
        };
      case "bestallningslage":
        return {
          rows: [
            { kind: "eta", text: "Beställningsvara" },
            { kind: "delivery", icon: "store", text: "Hämta gratis i butik inom 4–8 veckor" },
            { kind: "delivery", icon: "truck", text: "Hemleverans inom 4–8 veckor" },
          ],
        };
      case "ej_tillganglig":
        return {
          rows: [
            { kind: "message", icon: "store", text: "Den här produkten är tillfälligt slut" },
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
            text: `4 st i lager hos ${STORE_NAME}`,
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
            text: `På väg till ${STORE_NAME}`,
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
            text: `Beställningsvara hos ${STORE_NAME}`,
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
      return {
        rows: [
          {
            kind: "message",
            icon: "store",
            text: "Denna produkt går inte att köpa ifrån butik",
          },
          // Snabbrörlig kan fortfarande hemlevereras även om butiken är slut.
          ...snabbHomeDelivery,
        ],
      };
  }
}

export function getOnlineBox(
  state: OnlineState,
  type: ProductType,
  directToCustomer: boolean,
): BoxContent | null {
  if ((type === "bestall" && !directToCustomer) || type === "lagervara") {
    return null;
  }

  // CL/WL/DI direkt till kund visas som hemleverans (lastbil, utan pris); annars leverans till ombud (paket).
  // Priset bakas in i ombud-texten (jfr "Hämta gratis i butik …") istället för en separat prislapp.
  const isHomeDelivery = directToCustomer && type === "bestall";
  const deliveryIcon = isHomeDelivery ? "truck" : "package";

  switch (state) {
    case "i_lager_cl":
      return {
        rows: [
          {
            kind: "stock",
            text: "Online: 100 st i lager",
            tone: "positive",
          },
          {
            kind: "delivery",
            icon: deliveryIcon,
            text: isHomeDelivery ? "Hemleverans inom 3–9 dagar" : "Levereras inom 2–5 dagar, från 49 kr",
          },
        ],
      };
    case "pa_vag_in":
      return {
        rows: [
          {
            kind: "eta",
            text: "På väg in online",
          },
          {
            kind: "delivery",
            icon: deliveryIcon,
            text: isHomeDelivery ? "Hemleverans inom 2–3 veckor" : "Levereras inom 2–3 veckor, från 49 kr",
          },
        ],
      };
    case "bestallningslage":
      return {
        rows: [
          {
            kind: "eta",
            text: isHomeDelivery ? "Beställ online" : "Beställningsvara online",
          },
          {
            kind: "delivery",
            icon: deliveryIcon,
            text: isHomeDelivery ? "Hemleverans inom 4–8 veckor" : "Levereras inom 4–8 veckor, från 49 kr",
          },
        ],
      };
    case "enbart_bl":
      return null;
    case "ej_tillganglig":
      return {
        rows: [
          {
            kind: "message",
            icon: deliveryIcon,
            text: "Går inte att beställa till ombud",
          },
        ],
      };
  }
}

export function getCardStatus(
  storeState: StoreState,
  onlineState: OnlineState,
  noStoreSelected: boolean,
  type: ProductType,
  directToCustomer: boolean,
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
  if (type === "bestall" && !directToCustomer && storeState !== "ej_tillganglig") {
    return { tone: "neutral", label: "Beställningsvara", sublabel: "4–8 v" };
  }
  return { tone: "gray", label: "Tillfälligt slut" };
}

export function getScenarioLabel(
  type: ProductType,
  storeState: StoreState,
  onlineState: OnlineState,
  noStoreSelected: boolean,
  directToCustomer: boolean,
): string {
  const typeLabel =
    type === "snabb" ? "Snabbrörlig" : type === "lagervara" ? "Lagervara" : "Möbler (större)";
  const storeLabel = noStoreSelected
    ? "Ingen butik vald"
    : getOptionLabel(storeState, storeOptions[type]);
  const onlineLabel =
    type === "lagervara"
      ? "Döljs (via butik)"
      : type === "bestall" && !noStoreSelected && !directToCustomer
      ? "Döljs (BL-driven)"
      : getOptionLabel(
          onlineState,
          type === "bestall" && directToCustomer ? onlineOptions.snabb : onlineOptions[type],
        );
  const directLabel = directToCustomer ? " · CL/WL/DI direkt" : "";

  return `${typeLabel}${directLabel} · Butik: ${storeLabel} · Online: ${onlineLabel}`;
}

function getOptionLabel<T extends string>(id: T, options: Option<T>[]) {
  return options.find((option) => option.id === id)?.label ?? id;
}
