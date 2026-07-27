# Electronics Warranty Tracker — Requirements Guide
### For planning your own build

This document explains **what** the app needs to do. It does not tell you exactly how to code it — that's on purpose. Read each requirement, think about how you would build it, and sketch your own plan before looking at the build guide.

**Related docs:** [Beginner_Build_Guide.md](Beginner_Build_Guide.md) shows one way to actually build this, step by step. [Software_Requirements_Specification.md](Software_Requirements_Specification.md) documents one real, existing version of this app.

---

## 1. The Problem

People buy all kinds of electronics — solar panels, batteries, TVs, phones, washing machines, and more. Each product has its own warranty period, and it can be anywhere from a few months to 20+ years.

When something breaks, the customer usually can't find the paper receipt, doesn't remember when they bought it, and isn't sure if the warranty is even still valid. The company then has to deal with confused customers and unverifiable claims. Nobody wins.

## 2. The Solution

A simple website with two jobs:

1. **Register** — right after buying a product, the customer fills out a short form (their name, phone number, which product, purchase date, and a photo/PDF of the invoice). The app saves it.
2. **Check** — anytime later, the customer types in their phone number and instantly sees every product they registered, and whether each one is still under warranty.

No accounts, no passwords. The phone number is enough to look things up.

## 3. Who Uses This App

There is only **one type of user: the customer.** There is no admin, no staff login, no back-office dashboard.

## 4. What's Out of Scope

To keep this simple, the app does **not** include:
- Logins, passwords, or user accounts
- An admin dashboard for managing products or viewing all registrations
- Automatic warranty claim submission or repair scheduling

If you're planning your own build, resist the urge to add these — they're not part of this app.

## 5. Important Design Decisions (read before you build)

A few choices matter enough to call out early, so you don't reinvent them halfway through:

- **One company, one catalog.** This app is built for a single company to run for itself — not a multi-company platform where different businesses sign up. There's no "tenant" concept. If a different company wanted to use this same app for their own products, they'd just clear out the sample data and load their own — no code changes needed. That's why the catalog (products, categories, purchase sources) should always live in the database, never hardcoded in your code.
- **Warranty length belongs to each product, not each category.** Two products in the same category (say, two different batteries) can have very different warranty lengths. So don't try to store "batteries get 3 years" as a rule — store the warranty length on each individual product instead.
- **Never store a warranty end date.** Since "is this still under warranty" depends on today's date, don't save that answer — recalculate it every time someone asks (`purchase date + warranty length`).

---

## 6. Database Requirements

You'll need three things stored in your database:

### 6.1 Products

**Why:** the customer needs to pick exactly what they bought, and the app needs to know how long that product is covered.

**What to store, per product:**
- A name (e.g., "Hybrid Solar Inverter 5kW")
- A category (e.g., Solar Panel, Inverter, Battery, TV, Refrigerator — whatever categories your business needs)
- An optional model number
- Warranty length, in months

**Check yourself:** can two products in the same category have different warranty lengths in your design? They should be able to.

### 6.2 Purchase Sources

**Why:** it's useful to know where a customer bought something (your own store, a dealer, an online marketplace), but the customer shouldn't be blocked from registering if they're not sure.

**What to store:** just a name (e.g., "Company Store," "Amazon," "Authorized Dealer").

**Check yourself:** can a registration be created with no purchase source at all? It should be optional, not required.

### 6.3 Warranty Registrations

**Why:** this is the actual record of "this customer bought this product on this date."

**What to store, per registration:**
- Owner's name
- Mobile number (required — this is how they'll look themselves up later)
- Email (optional)
- Which product (required)
- Which purchase source (optional)
- Purchase date
- Warranty start date (in this app, it's just the same as the purchase date)
- A reference to the uploaded invoice file, if one was provided (just the file's location, not the file itself)
- Notes (optional)

**Check yourself:** did you avoid adding a "warranty end date" or "status" column? Good — those get calculated, not stored (see Section 5).

---

## 7. Backend (API) Requirements

Your backend needs to expose a small set of operations. Think of each one as a question the frontend will ask.

### 7.1 "What products can I choose from?"
- Return the full product list.
- Return one product by its ID.
- Let the frontend search products by name (for a searchable dropdown).

### 7.2 "What purchase sources can I choose from?"
- Return the full purchase source list.
- Return one purchase source by its ID.

### 7.3 "Please save this registration"
This is the most important, and trickiest, part. When a registration is submitted:
- Make sure the product actually exists. Reject if it doesn't.
- If a purchase source was given, make sure it exists too. Reject if it doesn't.
- Reject if the purchase date is in the future.
- Reject if the purchase date is too old — pick a window (e.g., "must register within 60 days of buying it") and stick to it.
- Reject if this exact registration (same phone number, same product, same purchase date, same source) already exists — don't let people double-register the same purchase.
- If all checks pass, save it, and tell the frontend the warranty end date so it can show the customer right away.

**Important:** every one of these checks must happen on the backend, even if the frontend already checks them too. Anyone could call your API directly and skip the frontend entirely.

### 7.4 "Please save this invoice file"
- Only accept certain file types (e.g., PDF, JPG, PNG) — reject anything else.
- Only accept files up to a certain size (e.g., 2 MB) — reject anything bigger.
- Never trust the file name the customer's browser sends — generate your own safe file name when saving it.
- Save the file somewhere on the server, and store only its location (not the file itself) in the database.

### 7.5 "Show me my registrations"
- Given a phone number, return every registration tied to it, with the product name/category already filled in (don't make the frontend ask twice).
- If there are none, say so clearly — don't treat "no results" as an error.

**Think about this:** a phone number isn't secret. Anyone who knows (or guesses) someone's number could look up their registrations through this feature. That's a real limitation of a no-login app — write it down as a known tradeoff instead of ignoring it. If this were a real production app, you might add a one-time code sent by SMS before showing results.

### 7.6 "Is this warranty still active?"
- Given a warranty start date and a warranty length (in months), calculate the end date.
- Decide on simple status labels — for example: **Active**, **Expiring Soon** (within 30 days of ending), **Expired**.
- Calculate this fresh every time it's asked for — never save it.

---

## 8. Frontend Requirements

### 8.1 Home Page
A simple landing page explaining what the site does, with two big buttons: "Register a Product" and "Check My Warranty."

### 8.2 Registration Form
One form collecting everything from Section 7.3: name, phone number, email (optional), product (picked from a real list, not typed), purchase source (optional dropdown), purchase date, notes (optional), and an invoice file (optional).

- Show clear, specific error messages if something's wrong (not just "something went wrong").
- On success, take the customer to a confirmation page.

### 8.3 Confirmation Page
After a successful registration, show a simple success message with a reference number, plus buttons to search for warranties or register another product.

### 8.4 Search Form
One field: phone number. Nothing else. Keep it that simple.

### 8.5 Results Page
Show every registration for that phone number as a list of cards. Each card should show:
- Product name and category
- Purchase date
- Warranty end date
- A clear status badge (Active / Expiring Soon / Expired), ideally color-coded
- A link to the invoice, if one was uploaded

If there are no results, show a friendly "nothing found" message — not an error page.

### 8.6 Form Validation
Check the obvious things before submitting (required fields filled in, phone number looks like a phone number, email looks like an email, file isn't too big). This gives instant feedback, but remember: it's a nice-to-have for the user, not a replacement for the backend checks in Section 7.3.

---

## 9. A Few Practical Concerns

| Topic | What to think about |
|---|---|
| Security | There's no login system here by design — but be deliberate about it. Don't put real database passwords in files that get committed to version control. Validate everything on the backend, always. |
| File uploads | Never trust a file's name or claimed type. Check it yourself before saving. |
| Fresh data | Don't store "warranty end date" or "status" — always calculate them when asked. |
| Growing data | Your product list and purchase source list will probably stay small — but your registrations list will keep growing. Think ahead about whether you'll need to paginate results someday. |
| Friendly errors | Every rejection from the backend should turn into a clear message on the screen — never a blank error or a crash. |

---

## 10. How to Use This Guide

1. Read a whole section before you start designing that part — don't design your database after reading only half of Section 6.
2. Sketch your own tables, endpoints, and pages *before* looking at the build guide.
3. Use the "check yourself" questions and Section 9 as your own testing checklist once something is built.
4. If a requirement doesn't say exactly how to do something, that's on purpose — that's your decision to make. Just make it deliberately, not by accident.
