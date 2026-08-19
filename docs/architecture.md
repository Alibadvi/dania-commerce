# Dania commerce architecture

The repository contains two independently deployable applications and their infrastructure:

- `app/`, `components/`, `lib/`: Persian RTL Next.js-compatible storefront.
- `commerce/`: Vendure server, worker, Dashboard, PostgreSQL configuration, and Zarinpal integration.
- `infra/`: Caddy reverse proxy and TLS routing.
- `docker-compose.yml`: local or single-server orchestration.

## Request flow

The browser talks only to the public storefront and Vendure Shop API. The Vendure Admin API and Dashboard are intended for the store team. PostgreSQL is private and is never exposed to the internet.

Zarinpal payments follow the provider's hosted-payment flow: Vendure creates a payment authority from the active order total, the storefront redirects to Zarinpal, and the callback returns to the storefront. Vendure verifies the authority server-side before settling the order. Merchant credentials stay in server environment variables.

## Production boundary

The checked-in code is a runnable product foundation. Before launch, provide real product data, SMS provider credentials, shipping rules, production Zarinpal credentials, final domains, email delivery, backups, monitoring, and generated database migrations. Do not enable TypeORM `synchronize` in production.
