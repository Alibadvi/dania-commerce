# Security

Please report security issues privately to the repository owner rather than opening a public issue.

Never commit `.env` files, database dumps, merchant IDs, passwords, tokens, customer data, or private keys. Rotate any credential that is accidentally exposed. Production deployments must use unique secrets, a private PostgreSQL network, regular encrypted backups, hardened Vendure APIs, HTTPS, and restricted Dashboard access.
