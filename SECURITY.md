# Security Policy

ModelPort is a local-first gateway meant to run on your own machine or inside
your own trusted network. Please do not open public issues for security
reports that involve real credentials, live endpoints, or other sensitive
details.

## Reporting a vulnerability

Please report suspected vulnerabilities privately via a GitHub Security
Advisory (Security tab → "Report a vulnerability") on this repository, rather
than a public issue. Include:

- A description of the issue and its impact.
- Steps to reproduce (with any secrets or real hostnames redacted).
- The version/commit you tested against.

## Handling of secrets

- Never commit real `.env` files, API keys, or database credentials. Use the
  `*.env.example` templates under `deploy/` as a starting point.
- Issues and pull requests should never include full `.env` contents,
  unredacted request/response logs, or live provider API keys.
