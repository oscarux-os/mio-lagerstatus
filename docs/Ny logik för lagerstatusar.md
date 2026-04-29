
Ruta 1 - Butik/hämta i butik:
- Lagersaldo i butik
- Hämta i butik ledtid. Finns den i butik kommer ledtiden att vara 60 minuter. Annars är det ledtid när den kommer tillbaka till butiken om beställning är gjord. Alternativt när den snarast kan beställas och hämtas upp i butik. Alltså skriver vi hämta i butik inom (ledtid)
- Frakkostnad kommer alltid vara 0kr när man hämtar i butik.
- Behöver fundera på ordval på när en vara är ej i lager i butiken men kan då komma tillbaka.
- Sällsynt att en produkt inte kan hämtas upp i en butik med det finns några exempel. Hur ska vi hantera denna ruta då? Online exclusive eller annat sätt? 
- Om produkt ej finns i lager så vill vi kunna välja att se hur många andra butiker den finns i lager i. Finns i x  andra butiker. 

Ruta 2 - Online/Leveranstid 
- Lagersaldo online, DI, WL, CL (Behöver vi visa lagersaldo från butiken här i de fallen?)
- Kortast leveranstid - från BL, DI, WL, CL
- Fraktkostnad från BL = 595kr. Fraktkostnad från DI, WL, CL = från 49:-
- Sällsynt att en produkt inte kan köpas med leverans men vi behöver ett enkelt sätt att hantera det som kund här.

---

## Specad logik (uppdaterad)

### Samlad copyöversikt

| Tillstånd        | Ruta 1 — Hämta i butik                                    | Ruta 2 — Leverans (snabbrörligt)                        | Ruta 2 — Leverans (beställningsvaror)                   |
| ---------------- | --------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------- |
| I lager          | "X st i lager hos [Butik]" + hämta (60 min) + hemleverans (om BL) | "Online: X st i lager" + "Levereras inom 2–5 dagar" | Visas i Ruta 1 (BL-driven) — Ruta 2 ej aktuell     |
| På väg in        | "På väg till [Butik]" · hämta i butik [datum] (leveransrad) | "Levereras inom 2–3 veckor"                          | "Hemleverans inom 2–3 veckor"                           |
| Beställningsläge | "Beställningsvara hos [Butik]" · hämta i butik [ledtid] (leveransrad) | "Levereras inom 4–8 veckor"                 | "Hemleverans inom 4–8 veckor"                           |
| Ingen butik vald | "Finns i lager i X butiker" + CTA "Välj butik"            | Visas normalt utan butikskontext                        | Visas normalt utan butikskontext                        |
| Fraktkostnad     | 0 kr                                                      | Från 49 kr                                              | 595 kr                                                  |
| Ej tillgänglig   | "Denna produkt går inte att köpa ifrån butik"             | "Den här produkten går inte att beställas med leverans" | "Den här produkten går inte att beställas med leverans" |

---

### Ruta 1 — Hämta i butik

**Ingen butik vald**
- Copy: "Finns i lager i X butiker"
- CTA: "Välj butik"
- Inga ledtider visas — korrekt ledtid kräver butikskontext
- Om produkten inte finns i någon butik alls: dölj rutan

Logiken skiljer sig mellan beställningsvaror och snabbrörliga. Beställningsvaror kan alltid beställas till butik oavsett lagerstatus. Snabbrörliga har inget beställningsläge i butik-rutan — antingen finns de eller är de på väg in.

#### Beställningsvaror 

**Finns i vald butik**
- Stockrad: "X st i lager hos [Butik]"
- Leveransrad 1: Hämta i butik – inom 60 min · 0 kr
- Leveransrad 2: Hemleverans inom 3–9 dagar · 595 kr
- Båda leveransalternativen visas eftersom källan är BL — hemleverans hör hemma här, inte i Ruta 2

**Finns ej i vald butik**
- Statusrad: "Beställningsvara hos [vald butik]"
- Leveransrad: Hämta i butik inom 4–8 veckor · 0 kr
- Inget saldo visas
- Länk: "Hämta direkt i X andra butiker" → öppnar panel med lagerstatus per butik för produkten

**På väg in till vald butik**
- Copy: "På väg till [vald butik] — hämta i butik [datum]"
- Inget saldo visas
- Fraktkostnad: 0 kr
- Ruta 2: faller in i beställningsläge och visar leveransdatum/ledtid från CL/WL när produkten ankommer dit

**Kan ej hämtas i butik (t.ex. online exclusive)**
- Visa meddelande, dölj ej rutan
- Copy: "Denna produkt går inte att köpa ifrån butik"
- Köpknapp: inaktiv

#### Snabbrörliga produkter

**Finns i vald butik**
- Stockrad: "X st i lager hos [Butik]"
- Leveransrad 1: Hämta i butik – inom 60 min · 0 kr
- Leveransrad 2: Hemleverans inom X–X veckor · 595 kr (visas bara om CL/WL inte har bättre alternativ — annars hanteras hemleverans i Ruta 2)
- Fraktkostnad hämtning: 0 kr

**På väg in till vald butik**
- Copy: "På väg till [Butik] — hämta i butik [datum]"
- Inget saldo visas
- Fraktkostnad: 0 kr

**Finns ej i vald butik — beställningsläge**
- Statusrad: "Beställningsvara hos [vald butik]"
- Leveransrad: Hämta i butik inom [ledtid] · 0 kr
- Ledtid styrs av lagerkälla: ~4 dagar om CL/WL har saldo, längre om beställningsvara (samma ledtid som Ruta 2)
- Länk: "Hämta direkt i X andra butiker" → öppnar panel med lagerstatus per butik

**Kan ej hämtas i butik (t.ex. online exclusive)**
- Visa meddelande, dölj ej rutan
- Copy: "Denna produkt går inte att köpa ifrån butik"

### Ruta 2 — Leverans

**Snabbrörligt sortiment — CL/WL/DI tillgängligt**
- Visar CL/WL/DI-ledtid och fraktkostnad (från 49 kr)
- Saldo märks explicit som "Online" eftersom källan är känd och ärlig
- Copy i lager: "Online: X st i lager — levereras inom 2–5 dagar"
- Copy beställningsläge: "Levereras inom 4–8 veckor"
- Fraktkostnad: från 49 kr (PostNord, DHL)

**Snabbrörligt sortiment — enbart butikslager tillgängligt**
- Ruta 2 visas inte — hemleverans från BL visas istället i Ruta 1 tillsammans med hämtningsalternativet
- Motivering: att kalla BL-saldo "online" vore missvisande, och saldot syns redan i Ruta 1

**Beställningsprodukt — levereras via butik → kund**
- Hemleverans är BL-driven (DI → butik → kund) och visas i Ruta 1 tillsammans med hämtningsalternativet
- Ruta 2 visas inte för beställningsvaror utan eget CL/WL-saldo
- Ledtiden inkluderar hela kedjan (DI → butik → kund)

**Kan ej levereras**
- Visa meddelande, dölj ej rutan
- Copy: "Den här produkten går inte att beställas med leverans"
- Köpknapp: inaktiv

**Noteringar**
- Ruta 2 visar endast CL/WL/DI-ledtid — BL-driven hemleverans hör hemma i Ruta 1
- Lagersaldo i Ruta 2 märks alltid som "Online:" — visas bara när källan faktiskt är CL/WL
- Leveranstid via omvägen DI → butik → kund är alltid längre än motsvarande ledtid i ruta 1 — ingen konflikt uppstår

---

### Fraktsätt per scenario

Vilken leveransmetod som visas i Ruta 1 respektive Ruta 2 styrs av produkttyp och lagerkälla.

| Scenario | Ikon i Ruta 1 | Ikon i Ruta 2 | Fraktkostnad |
| -------- | ------------- | ------------- | ------------ |
| Snabbrörlig — hämta i butik | 🏪 Butik | — | 0 kr |
| Snabbrörlig — CL/WL/DI tillgängligt | 🏪 Butik | 🚚 Lastbil | Ruta 1: 0 kr · Ruta 2: från 49 kr |
| Snabbrörlig — enbart BL (ingen online) | 🏪 Butik + 🏠 Hem | — (Ruta 2 döljs) | Hämtning 0 kr · Hemleverans 595 kr |
| Beställningsvara — butik i lager | 🏪 Butik + 🏠 Hem | — (Ruta 2 döljs) | Hämtning 0 kr · Hemleverans 595 kr |
| Beställningsvara — beställningsläge | 🏪 Butik + 🏠 Hem | — (Ruta 2 döljs) | Hämtning 0 kr · Hemleverans 595 kr |
| Beställningsvara — CL/WL direkt (framtid) | 🏪 Butik | 🏠 Hem | Ruta 1: 0 kr · Ruta 2: från 49 kr |

**Princip:** BL-driven hemleverans (butik → kund) visas alltid i Ruta 1 tillsammans med hämtningsalternativet — aldrig i Ruta 2. Ruta 2 reserveras för CL/WL/DI-flöden där Mio äger hela leveranskedjan.

---

### Öppet
- Beställningsvara slutsåld — ska vi flagga "skräddarsydd/tillverkas vid beställning" som USP, och var/hur kommuniceras det?
- Postnummervalidering för Outlet (tas i v2)



