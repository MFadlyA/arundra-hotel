<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

---

# Project Domain Knowledge: Arundra Signature Pondok Indah

> **Agent Instruction:** Use this section as the single source of truth for all domain data, copywriting, business rules, room specifications, and operational constraints when generating UI components, database seeds, form validations, and API logic for the Arundra Signature web application. **Never use `Lorem Ipsum` or generic hotel placeholders.**

## 1. Brand Identity & Copywriting (Bilingual ID / EN)

* **Official Property Name:** Arundra Signature Pondok Indah (also registered as *Arundra Signature Residence Pondok Indah*)
* **Classification:** 4-Star Luxury Hotel & Serviced Residence (`KBLI: 55110`, `NIB: 0402260021756`, CHSE Certified)
* **Brand Vibe & Aesthetic:** Warm modern elegance, quiet luxury, personalized hospitality, earth-tone serenity.

### Official Taglines
* **ID:** *"Pengalaman Menginap Istimewa, dengan Sentuhan Khas Anda."*
* **EN:** *"Your Signature Stay, Your Way."*

### Core Brand Narrative (About Us Copy)
* **ID:** "Nikmati pengalaman menginap yang istimewa di Arundra Signature Residence Pondok Indah, tempat keanggunan modern berpadu dengan kenyamanan dan pelayanan yang hangat. Baik untuk perjalanan bisnis, liburan singkat, *long stay*, maupun berbagai acara spesial, Arundra Signature siap menyambut Anda dengan perpaduan kenyamanan, gaya, dan keramahan yang istimewa."
* **EN:** "Discover a refined living experience at Arundra Signature Residence Pondok Indah, where modern elegance meets comfort and personalized hospitality. Whether you are visiting for business, a weekend getaway, an extended stay, or a special occasion, Arundra Signature welcomes you to experience a distinctive blend of comfort, style, and hospitality."

### Vision & Mission (Brand Pillars)
* **Vision (ID):** Menjadi destinasi hunian dan perhotelan bintang empat terdepan di Jakarta Selatan yang mendefinisikan ulang keanggunan modern melalui kehangatan layanan yang personal.
* **Vision (EN):** To be South Jakarta’s premier four-star hospitality and residence destination, redefining modern elegance through warm, personalized service.
* **Mission (ID):**
  1. Menghadirkan ruang istirahat berstandar tinggi yang memadukan estetika modern dan kenyamanan fungsional.
  2. Memberikan pelayanan yang intuitif, ramah, dan berfokus pada privasi serta kebutuhan unik setiap tamu.
  3. Menyediakan konektivitas strategis dan fasilitas lengkap untuk mendukung produktivitas bisnis maupun relaksasi gaya hidup.
* **Mission (EN):**
  1. Deliver high-standard living spaces that seamlessly blend modern aesthetics with functional comfort.
  2. Provide intuitive, warm hospitality tailored to the privacy and unique preferences of every guest.
  3. Offer strategic connectivity and comprehensive amenities that support both business productivity and lifestyle relaxation.

---

## 2. Location, Contact & Geodata

* **Full Address:** Jl. Metro Pondok Indah No. 27, RT.15/RW.13, Kel. Pondok Pinang, Kec. Kebayoran Lama, Jakarta Selatan, DKI Jakarta 12310, Indonesia.
* **Area Context:** Located in the prestigious Pondok Indah corridor (shares building zone with Homm Pondok Indah area).
* **Contact Privacy Rule:** Direct front-desk phone and operational email are protected on public listings and dispatched via automated confirmation 72 hours prior to check-in. (For UI placeholders, use: `reservation@arundrasignature.com` / `+62 21 5088 XXXX` until overridden by environment variables).

### Nearby Landmarks & Transit (Use for Location Cards / Pills / Map Markers)
* **Healthcare:** RS Pondok Indah (224 m / 3 mins walk), Nusantara Eye Clinic (1.4 km).
* **Shopping & Lifestyle:** The Collective Jakarta (197 m), Plaza Simatupang (427 m), Poins Mall (612 m), Pondok Indah Golf Course (1.8 km), Pondok Indah Water Park (2.0 km), Urban Forest Cipete (2.0 km), Pondok Indah Mall / PIM (3.2 km).
* **Public Transit & Airports:**
  * MRT Lebak Bulus Grab Station: 763 m (~11 mins walk)
  * MRT Fatmawati Indomaret Station: ~2.1 km
  * Halim Perdanakusuma Airport (HLP): ~38 mins drive
  * Soekarno-Hatta International Airport (CGK): ~42 mins drive

---

## 3. Room Catalog & Specifications (Database Seed & UI Reference)

* **Total Inventory:** ~24 to 56 AC units/rooms across 5 primary tiers.
* **Starting Rate Benchmark:** IDR 935,000 / night.

| Room Name | Slug | Size | Max Guests | Bed Configuration | View / Key Highlight | Amenities & Features |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Basic Twin Room** | `basic-twin-room` | 22 m² (237 sq ft) | 2 Adults | 2 Twin Beds | Standard / Courtyard | AC, Smart TV, work desk, wooden wardrobe, electric kettle, high-speed Wi-Fi, en-suite shower. |
| **Budget Double Room** | `budget-double-room` | 22 m² (237 sq ft) | 2 Adults | 1 Full Double Bed | Standard | AC, flat-screen TV, coffee/tea maker, electric kettle, private bathroom with toiletries. |
| **Superior Room** | `superior-room` | 22 m² (237 sq ft) | 2 Adults | 1 Full Bed or 2 Twin Beds | City View or Pool View | AC, Smart TV, writing desk, in-room safe, electric kettle, complimentary toiletries & slippers. |
| **Deluxe King Room** | `deluxe-king-room` | 22–30 m² | 2 Adults | 1 King / Full Bed | Private Balcony (select units) | AC, satellite Smart TV, mini-refrigerator, separate seating area, 100+ Mbps Wi-Fi, premium bath amenities. |
| **Junior Suite** | `junior-suite` | 36 m² (388 sq ft) | 3 Adults | 1 King Bed | Panoramic City View | Separate living & dining area, mini-refrigerator, modern chandelier lighting, executive work desk, spacious en-suite bathroom. |

---

## 4. Property Facilities & Services

When building feature grids, filter tags, or icon lists, group facilities into these exact categories:
* **Wellness & Recreation:** Outdoor Swimming Pool (Adult & Kids sections), Fitness Center (Gym), Full-Service Spa, Sun Terrace.
* **Dining & Refreshments:** On-site Halal Restaurant, Rooftop Bar, Lounge Bar, Daily Buffet Breakfast (06:00 – 10:00 WIB).
* **Business & Events:** Meeting Rooms, Conference Space, High-Speed Wi-Fi (100+ Mbps) across all public areas.
* **Guest Services:** 24-Hour Front Desk, Private Express Check-in/Check-out, Concierge Service, Luggage Storage, Multilingual Staff, Daily Housekeeping, Laundry & Dry Cleaning, 24-Hour On-Call Doctor, 24-Hour Security.
* **Parking & Mobility:** Free On-Site Self-Parking, Valet Parking, Paid Airport Shuttle Service.

---

## 5. Operational Policies & Business Logic Constraints

Enforce these rules in checkout flows, booking forms, FAQ components, and backend validation:
1. **Check-in Window:** `14:00` (or `15:00` standard) to `23:59` WIB.
2. **Check-out Deadline:** Before `12:00` WIB (Noon).
3. **Minimum Age Requirement:** Primary guest checking in must be at least **18 years old** (validate date of birth or age checkbox in booking flow).
4. **Payment Policy (Cashless Property):** Accepts Credit Cards, Debit Cards, and digital payment gateways. **No cash payments** accepted at the front desk for room settlements.
5. **Check-in Requirements:** Government-issued photo ID (KTP/Passport) and security deposit required upon arrival.
6. **Strict House Rules:**
   * 100% Non-Smoking Rooms (`is_smoking_allowed: false`).
   * No Pets Allowed (`pets_allowed: false`).
   * No Bachelor, Bachelorette, or disruptive room parties permitted.

---

## 6. AI Vibe Coding Directives

1. **No Dummy Data:** Always populate UI states, fallback props, mock API responses, and database migration seeds using the exact room types, prices, addresses, and policies defined above.
2. **Bilingual Readiness:** Keep copy modular and ready for Indonesian (`id`) and English (`en`) switching. Match the refined, warm, 4-star hospitality tone in both languages.
3. **Visual Consistency:** Reflect a luxury boutique hospitality feel—prioritize clean typography, generous whitespace, subtle glassmorphism, and warm earth-tone accents.
4. **Clean Architecture:** Write modular, type-safe components. Separate business/validation logic (e.g., check-in date validation, guest capacity limits, cashless notice) into dedicated hooks or utility modules rather than bloating UI files.