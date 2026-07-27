# Requirements Guide
## Multi-Brand Electronics Warranty Registration Portal — for planning your own build

This document states **what** the system must do — not how to build it. Use it to design your own database schema, API contract, and UI before writing code. Each requirement has a use case (why it exists) and acceptance criteria (how you'll know it's satisfied), so you can plan your own approach rather than follow prescribed steps.

> **Scope note:** this system is a **general electronics warranty tracker**, not tied to one product category. The company operating it may sell or service TVs, refrigerators, washing machines, air conditioners, mobile phones, laptops, microwaves, water heaters, and more — carrying products from **multiple brands/manufacturers**, each with its own warranty terms. Nothing in the design should assume a single category or a single brand.
>
> **Deployment model — this is not a SaaS product.** It is a **single-tenant application**: one deployment serves one operating company, with one shared catalog and one shared set of registrations — there is no per-customer account, subscription, or tenant isolation. "General" here means the *catalog is data, not code* — brands, categories, and products live in the database, not hardcoded in the application. That's what lets a **different** company adopt this same codebase later: wipe the seeded brands/products/purchase sources and load their own catalog, and the app becomes theirs, with no code changes. Plan your schema and business logic so they never assume a specific brand, category, or company name — assume instead that *someone else's* data will eventually replace your seed data entirely.

**Companion documents** (optional, read after you've made your own plan): [Software_Requirements_Specification.md](Software_Requirements_Specification.md) documents one existing implementation for reference (note: that implementation was narrowed to a single solar-products brand — treat it as one example, not the target scope); [Beginner_Build_Guide.md](Beginner_Build_Guide.md) walks through one way to build the general version step by step.

---

## 1. Purpose & Actors

**Purpose:** let a customer register the warranty for an electronic product they bought — of any category, from any brand the platform tracks — and later check whether that product is still covered, with no login required.

**Actor:** Customer (the only user role — there is no admin, staff, or authenticated user in this system).

---

## 2. Requirements Overview

| Layer | # | Requirement | Summary |
|---|---|---|---|
| Database | DB-1 | Brand Catalog | Store which manufacturers/brands the platform tracks |
| Database | DB-2 | Product Catalog | Store what products exist, which brand they belong to, and their warranty length |
| Database | DB-3 | Purchase Sources | Store where products can be bought |
| Database | DB-4 | Warranty Registrations | Store each customer's registration |
| Backend | BE-1 | Browse Brands | Serve the brand list to the frontend |
| Backend | BE-2 | Browse Products | Serve the product catalog, filterable by brand/category |
| Backend | BE-3 | Browse Purchase Sources | Serve the purchase-source list |
| Backend | BE-4 | Create Registration | Accept and validate a new warranty registration |
| Backend | BE-5 | Store Invoice File | Accept, validate, and persist an uploaded file |
| Backend | BE-6 | Retrieve Registrations | Serve registration data back out (by id, by mobile, all) |
| Backend | BE-7 | Compute Warranty Status | Derive end date and coverage status on demand |
| Frontend | FE-1 | Landing / Navigation | Orient a first-time visitor toward the two flows |
| Frontend | FE-2 | Registration Form | Let a customer submit a new registration across any brand/category |
| Frontend | FE-3 | Registration Confirmation | Confirm success and guide next steps |
| Frontend | FE-4 | Search Form | Let a customer look up their registrations |
| Frontend | FE-5 | Results Display | Show registrations with warranty status |
| Frontend | FE-6 | Client-side Validation | Catch obvious errors before hitting the server |

---

## 3. Database Requirements

### DB-1 — Brand Catalog

**Use case:** *As the platform operator, I want to track multiple manufacturers/brands (not just one company's products), so the same portal can register a customer's television from one brand and their refrigerator from a completely different brand.*

**Requirements:**
- The system shall store a list of brands, each with a unique identifier and a name.
- Every product (DB-2) shall belong to exactly one brand.
- Brand shall be modeled as its own entity (not a free-text field on the product), so it can be listed, filtered, and reused consistently across many products.

**Acceptance criteria:**
- [ ] A brand can exist with zero products (e.g., newly added before any product is catalogued).
- [ ] The brand list can be queried in full and by id.
- [ ] Two different brands can each have a product in the same category (e.g., two brands both selling "Refrigerator") without conflict.

### DB-2 — Product Catalog

**Use case:** *As a customer, I need to select the exact product I bought — a specific model, from a specific brand, in a specific category — and the system needs to know how long that specific product is covered for, since warranty length varies enormously by category (a TV might carry a 1–2 year warranty; a solar panel or major appliance compressor might carry 10–25 years) and can even vary by brand for the same category.*

**Requirements:**
- The system shall store a catalog of products, each with: a unique identifier, a required link to a brand, a name, a category (e.g., Television, Refrigerator, Washing Machine, Air Conditioner, Mobile Phone, Laptop, Microwave Oven — the category list itself shall not be hardcoded to one industry), an optional model number, and a warranty length expressed in months.
- Warranty length shall be defined **per product**, not per category or per brand — plan for it to vary even within the same brand and category.
- Category shall be a plain, filterable/groupable attribute. Decide during planning whether it needs to be its own lookup table (enforcing a fixed set of categories) or a free-text field (allowing new categories without a schema change) — document your choice.

**Acceptance criteria:**
- [ ] Every product has a positive, non-zero warranty length and a valid brand reference.
- [ ] Products can be filtered/grouped by brand, and independently by category.
- [ ] The catalog can be queried in full, by id, and by a partial name match.
- [ ] Adding a brand-new category of product (one never seen before) does not require changing the product table's structure.

### DB-3 — Purchase Sources

**Use case:** *As the platform operator, I want to know which sales channel a registration came from (a physical store, an authorized dealer, an online marketplace), but a customer who isn't sure where they bought something shouldn't be blocked from registering.*

**Requirements:**
- The system shall store a list of purchase sources, each with a unique identifier and a name.
- A registration's link to a purchase source shall be **optional**, not required.
- Purchase sources are independent of brand — the same purchase source (e.g., a large marketplace) may sell products from many different brands.

**Acceptance criteria:**
- [ ] The list can be queried in full and by id.
- [ ] A registration can be created with no purchase source specified.

### DB-4 — Warranty Registrations

**Use case:** *As a customer, I need my registration (identity, product, purchase details, proof of purchase) stored durably, so it can be retrieved later using just my mobile number — regardless of which brand or category the product belongs to.*

**Requirements:**
- The system shall store, per registration: owner name, mobile number, optional email address, a required link to exactly one product (which in turn identifies its brand and category), an optional link to one purchase source, the purchase date, the warranty start date, an optional reference to an uploaded invoice file, optional free-text notes, and a creation timestamp.
- Owner identity fields (name/mobile/email) shall be captured directly on the registration — decide during planning whether you want to normalize this into a separate "customer" entity instead, and document the tradeoff either way (denormalized is simpler; normalized avoids duplicate owner data across multiple registrations by the same person).
- The table shall **not** store a pre-computed warranty end date or coverage status. Both change purely as a function of the current date, so persisting them risks staleness — plan to compute them on demand (see BE-7) instead of storing them.
- The invoice reference shall store a pointer to the file's location (e.g., a path or URL), never the file's raw bytes, in this table.
- A registration is never restricted to products from a single brand — the schema must allow a customer to hold registrations across many different brands and categories simultaneously.

**Acceptance criteria:**
- [ ] A registration cannot be created without a valid product reference.
- [ ] A registration can be created with or without a purchase source, email, notes, or invoice file.
- [ ] Registrations for the same mobile number, spanning different brands and categories, can be queried together.

---

## 4. Backend Requirements

### BE-1 — Browse Brands

**Use case:** *As a customer filling out the registration form, I may want to narrow the product list down by brand first, especially if the full catalog spans many manufacturers.*

**Requirements:**
- The system shall expose read access to the full brand list.
- The system shall expose read access to a single brand by its identifier, returning a not-found result if it doesn't exist.

### BE-2 — Browse Products

**Use case:** *As a customer, I need the current product catalog — across all brands and categories — so I can select what I bought, ideally narrowed down rather than one giant flat list.*

**Requirements:**
- The system shall expose read access to the full product catalog.
- The system shall expose read access to a single product by its identifier, returning a not-found result if it doesn't exist.
- The system shall support searching/filtering products by a partial name match, and shall support narrowing by brand and/or category, for use in a large, multi-brand picker.

### BE-3 — Browse Purchase Sources

**Use case:** *As a customer, I need the list of purchase sources to populate an optional dropdown.*

**Requirements:**
- The system shall expose read access to the full purchase-source list, and to a single source by id (not-found if missing).

### BE-4 — Create a Warranty Registration

**Use case:** *As a customer, I want to submit my registration — for whatever brand and category of product I bought — and be told clearly if something about it is invalid, rather than silently failing or getting a generic error.*

**Requirements:**
- The system shall accept: owner name, mobile number, optional email, a product reference, an optional purchase-source reference, a purchase date, optional notes, and an optional invoice file, in a single request.
- The system shall reject the request if the referenced product does not exist.
- The system shall reject the request if a purchase source is specified but does not exist.
- The system shall reject a purchase date that is in the future.
- The system shall reject a purchase date older than a defined registration window (plan a specific number of days and document your reasoning — e.g., "customers must register within N days of purchase").
- The system shall reject a registration that duplicates an existing one (same mobile number, same product, same purchase date, same purchase source) rather than silently creating a second copy.
- On success, the system shall persist the registration and return enough information for the frontend to confirm success and show the computed warranty coverage (see BE-7) — including which brand and category the product belongs to.
- Every validation rule enforced by the frontend (FE-6) shall also be enforced here — the frontend is a convenience, not a security boundary. A request sent directly to this endpoint (bypassing the UI) must be validated identically.

**Acceptance criteria:**
- [ ] Each rejection reason returns a distinct, human-readable message the frontend can display.
- [ ] Submitting identical data twice succeeds once and is rejected the second time.
- [ ] A successful submission is retrievable afterward via BE-6.
- [ ] The same validation rules apply identically regardless of which brand or category the product belongs to.

### BE-5 — Store an Invoice File

**Use case:** *As a customer, I want to attach proof of purchase (a photo or PDF of my invoice) to my registration, whatever the product.*

**Requirements:**
- The system shall accept an optional file upload as part of registration creation.
- The system shall restrict accepted file types to a defined allow-list (plan which types make sense for an invoice: image formats and PDF are typical).
- The system shall reject files above a defined maximum size, and communicate the limit in the rejection message.
- The system shall not trust the client-supplied filename for storage — plan how you'll generate a safe, collision-free name server-side.
- The system shall persist the file somewhere retrievable later and store only a reference to it (not the file content) on the registration record.

**Acceptance criteria:**
- [ ] A disallowed file type is rejected before being written to storage.
- [ ] An oversized file is rejected before being written to storage.
- [ ] Two uploads with the same original filename never overwrite each other.
- [ ] A stored file can be retrieved/viewed via the reference saved on the registration.

### BE-6 — Retrieve Registrations

**Use case:** *As a customer, I want to look up my previously submitted registrations using only my mobile number — no password, no account — and see all of them together even if they span several different brands.*

**Requirements:**
- The system shall expose retrieval of all registrations for a given mobile number, joined with enough product/brand/purchase-source detail that the frontend doesn't need extra round-trips just to show names.
- The system shall expose retrieval of a single registration by its own identifier.
- The system shall expose retrieval of the full registration list (useful for internal testing/support; decide during planning whether this needs to exist in the shipped product at all).
- The system shall clearly distinguish "no registrations found for this number" from an actual error, in a way the frontend can handle without treating it as a failure.

**Acceptance criteria:**
- [ ] Querying an unused mobile number returns an empty/not-found result the frontend renders as "no warranties found," not an error page.
- [ ] Querying a used mobile number returns every registration tied to it — across any brand/category — with product name, brand, category, and purchase-source name already resolved.

**Plan this deliberately:** a mobile number alone is not proof of identity. Decide during planning whether this system needs any verification step (e.g., an OTP sent to that number) before returning personal data and invoice links — and document your decision either way rather than leaving it unconsidered.

### BE-7 — Compute Warranty Status

**Use case:** *As a customer, I want to know at a glance whether my product is still covered, without doing date math myself — regardless of how long that particular product's warranty period happens to be.*

**Requirements:**
- The system shall be able to derive a warranty end date from a registration's warranty start date and its product's warranty length in months.
- The system shall be able to classify a registration's current coverage as, at minimum: still covered, covered but ending soon, or no longer covered — plan your own thresholds and label names.
- This computation shall happen at read/request time, not be persisted, since it depends on "today's date."
- Decide during planning whether this computation belongs on the backend, the frontend, or both — and if both, plan to share one implementation (or at least one well-tested rule set) so the two never disagree on edge cases like month-end date arithmetic.

**Acceptance criteria:**
- [ ] A registration whose end date has passed is classified as expired.
- [ ] A registration nearing its end date (within your chosen threshold) is classified distinctly from one that's safely active.
- [ ] The same registration, queried on two different days, can return two different statuses without any write to the database.
- [ ] The logic works identically for a product with a 12-month warranty and one with a 300-month warranty — no category-specific special-casing.

---

## 5. Frontend Requirements

### FE-1 — Landing / Navigation

**Use case:** *As a first-time visitor, I want to immediately understand what this site is for and how to get started, without reading instructions.*

**Requirements:**
- The system shall present a landing page that identifies the purpose of the site (registering/checking warranties across the platform's supported brands and product categories) and offers exactly two clear paths: register a product, or check an existing registration.

### FE-2 — Registration Form

**Use case:** *As a customer, I want a single form to submit everything needed to register my product, with the product catalog presented in a way I can actually browse — even though it may span dozens of brands and many categories — not a raw list of database IDs.*

**Requirements:**
- The system shall present a form collecting every field BE-4 accepts.
- The product field shall be a selectable list sourced from BE-2, not free text, and shall let the customer narrow the list down (e.g., by brand and/or category) rather than scrolling one flat list, since the catalog is not limited to one product line.
- The purchase-source field shall be a selectable, optional list sourced from BE-3.
- The form shall allow attaching a single invoice file.
- On submission, the system shall call BE-4 and handle both success and every distinct rejection reason it can return, presenting each clearly to the user.
- On success, the system shall route the user toward FE-3 with enough information to display a confirmation.

### FE-3 — Registration Confirmation

**Use case:** *As a customer who just registered, I want confirmation it worked and a clear next step.*

**Requirements:**
- The system shall display confirmation of a successful registration (including some reference the customer could quote to support later, and which brand/product it was for) and offer a path to FE-4 (search) and back to FE-2 (register another).

### FE-4 — Search Form

**Use case:** *As a returning customer, I want the simplest possible way to check my warranties: just my mobile number.*

**Requirements:**
- The system shall present a single-field form for mobile number, validated to a plausible format before submission.
- On submission, the system shall route to FE-5 with the entered number.

### FE-5 — Results Display

**Use case:** *As a customer, I want to see every product I've registered — however many different brands or categories they span — each with a clear visual signal of its coverage status, without interpreting raw dates myself.*

**Requirements:**
- The system shall call BE-6 for the given mobile number and handle the "no registrations found" case with a friendly empty state, not an error.
- For each registration returned, the system shall determine and display its warranty status per BE-7's rules, along with product name, brand, category, purchase date, computed warranty end date, and a link to the invoice file if one was uploaded.
- Status shall be visually distinguishable at a glance (e.g., color-coded), and shall render consistently no matter which brand/category the underlying product belongs to.

### FE-6 — Client-side Validation

**Use case:** *As a customer, I want to be told about a mistake in my form immediately, not after waiting on a server round-trip.*

**Requirements:**
- The system shall validate required fields, mobile number format, email format (if provided), and file constraints (type/size) before submitting to the backend.
- Every rule enforced here shall match a corresponding backend rule (BE-4, BE-5) exactly — client-side validation is a UX improvement, never a substitute for server-side enforcement.

---

## 6. Non-Functional Requirements (plan for these from the start)

| Area | Requirement to plan for |
|---|---|
| **Security** | No authentication exists in this system by design — but decide deliberately how much you're willing to expose through the mobile-number lookup (BE-6), and document that decision. Never commit real database credentials to source control. Validate every rule server-side regardless of what the frontend already checks. |
| **File handling** | Never trust an uploaded file's name or declared type alone; validate extension/size before writing to disk, and generate your own storage filename. |
| **Data integrity** | Don't persist values that are only correct "as of today" (warranty end date, status) — compute them on read. |
| **Extensibility** | Adding a new brand or a new product category should require only new rows of data, never a schema or code change — treat this as a design constraint, not an afterthought. |
| **Usability** | Every rejection from the backend should map to a specific, human-readable message on the frontend — avoid generic "something went wrong" errors. A large multi-brand catalog needs a genuinely browsable picker, not a 500-item dropdown. |
| **Performance** | Plan for the brand/product/purchase-source catalogs to grow much larger than a single-brand catalog would (potentially many brands × many categories × many models) — consider search/filtering performance, not just raw listing. Plan for the registrations table to grow — consider whether your retrieval endpoints will need pagination as data grows. |
| **Maintainability** | Keep warranty-status computation logic in one place per tier (don't duplicate the date math inconsistently between backend and frontend). Keep category values from becoming implicit business logic scattered across the codebase (e.g., don't hardcode "if category == X" branches in multiple places). |

---

## 7. How to use this document

1. Read every requirement in a section before designing that layer — don't design the database while only half-reading DB-4, for example.
2. For each requirement, sketch your own schema/endpoint/component *before* checking the companion SRS or build guide.
3. Use the acceptance criteria as your own test checklist once you've built something.
4. Where a requirement says "decide during planning" or "plan your own," that's intentional — this document tells you what must be true, not the specific value or approach. Write your decision down (even briefly) so you can explain it later.
5. Resist the urge to hardcode any single brand or category into your design — every requirement above is written so it holds whether the platform tracks 1 brand or 100, and 1 category or 20.
