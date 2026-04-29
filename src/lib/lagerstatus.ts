export type ProductType = "snabb" | "bestall";
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
      icon: "store" | "truck" | "home";
      text: string;
      price?: string;
    }
  | {
      kind: "message";
      icon: "store" | "truck" | "home";
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
};

export function getStoreBox(
  state: StoreState,
  noStoreSelected: boolean,
  type: ProductType,
): BoxContent {
  const pickupLeadTime = type === "snabb" ? "inom 2–5 dagar" : "inom 4–8 veckor";

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
            text: "Hämta i butik – inom 60 minuter",
            price: "0 kr",
          },
          ...(type === "bestall"
            ? [
                {
                  kind: "delivery" as const,
                  icon: "home" as const,
                  text: "Hemleverans inom 3–9 dagar",
                  price: "595 kr",
                },
              ]
            : []),
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
            text: "Hämta i butik från 15 maj",
            price: "0 kr",
          },
          ...(type === "bestall"
            ? [
                {
                  kind: "delivery" as const,
                  icon: "home" as const,
                  text: "Hemleverans inom 2–3 veckor",
                  price: "595 kr",
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
            text: "Hämta i butik inom 4–8 veckor",
            price: "0 kr",
          },
          ...(type === "bestall"
            ? [
                {
                  kind: "delivery" as const,
                  icon: "home" as const,
                  text: "Hemleverans inom 4–8 veckor",
                  price: "595 kr",
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
        ],
      };
  }
}

export function getOnlineBox(
  state: OnlineState,
  type: ProductType,
  directToCustomer: boolean,
): BoxContent | null {
  if (type === "bestall" && !directToCustomer) {
    return null;
  }

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
            icon: directToCustomer && type === "bestall" ? "home" : "truck",
            text:
              directToCustomer && type === "bestall"
                ? "Hemleverans inom 3–9 dagar"
                : "Levereras inom 2–5 dagar",
            price: "Från 49 kr",
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
            icon: directToCustomer && type === "bestall" ? "home" : "truck",
            text:
              directToCustomer && type === "bestall"
                ? "Hemleverans inom 2–3 veckor"
                : "Levereras inom 2–3 veckor",
            price: "Från 49 kr",
          },
        ],
      };
    case "bestallningslage":
      return {
        rows: [
          {
            kind: "eta",
            text:
              directToCustomer && type === "bestall"
                ? "Beställ online"
                : "Beställningsvara online",
          },
          {
            kind: "delivery",
            icon: directToCustomer && type === "bestall" ? "home" : "truck",
            text:
              directToCustomer && type === "bestall"
                ? "Hemleverans inom 4–8 veckor"
                : "Levereras inom 4–8 veckor",
            price: "Från 49 kr",
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
            icon: directToCustomer && type === "bestall" ? "home" : "truck",
            text: "Den här produkten går inte att beställas med leverans",
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
  const typeLabel = type === "snabb" ? "Snabbrörlig" : "Beställningsvara";
  const storeLabel = noStoreSelected
    ? "Ingen butik vald"
    : getOptionLabel(storeState, storeOptions[type]);
  const onlineLabel =
    type === "bestall" && !noStoreSelected && !directToCustomer
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
