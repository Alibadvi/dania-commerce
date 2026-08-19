# Dania Commerce

Premium Persian RTL commerce foundation for **Dania**, a children's footwear brand.

## Included

- Responsive storefront with home, PLP, PDP, cart, checkout, account, brand story, and size guide
- Next.js App Router code running on the Vinext deployment adapter
- Local interactive cart and product filtering for immediate design review
- Vendure 3.7 server, worker, React Dashboard, assets, search, and email foundation
- PostgreSQL and single-server Docker Compose setup
- Server-side Zarinpal request and verification flow
- Persian-first (`fa`, RTL) content and Iranian Rial commerce configuration
- Caddy routing and automatic TLS foundation for both domains

## Run the storefront

Requirements: Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

## Run the complete stack

Copy the environment template and replace every placeholder before exposing the stack publicly:

```bash
cp .env.example .env
docker compose up --build
```

The reverse proxy serves the storefront and routes Vendure's Shop API, Admin API, Dashboard, assets, and development mailbox. PostgreSQL remains on the private container network.

## Applications

```text
app/             storefront routes
components/      shared interface and cart components
lib/             catalog, money, and Vendure client boundary
commerce/        Vendure server, worker, Dashboard, and Zarinpal plugin
infra/           reverse proxy and TLS configuration
docs/            architecture notes
```

## Important launch note

This repository is a complete runnable foundation, not a claim that payment or production operations are active without credentials. Live launch still requires the real Zarinpal Merchant ID, product catalog, SMS provider, shipping rules, email service, final DNS, database migration, backup policy, monitoring, and end-to-end testing against the merchant's sandbox and production accounts.

See [docs/architecture.md](docs/architecture.md) and [SECURITY.md](SECURITY.md).
