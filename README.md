# PrimeSec

Landing page da PrimeSec: consultoria de tecnologia com desenvolvimento e segurança da informação.

## Stack

- [Nuxt 4](https://nuxt.com)
- [Nuxt UI](https://ui.nuxt.com)
- [Nuxt Content](https://content.nuxt.com)

## Desenvolvimento

```bash
pnpm install
pnpm dev
```

Conteúdo da home em `content/index.yml`.

### Fronteiras do globo

O globo lê `public/data/country-lines.bin`, gerado a partir do TopoJSON em
`scripts/data/countries-110m.json`. Regenere depois de trocar a fonte:

```bash
pnpm data:countries
```

## Produção

```bash
pnpm build
pnpm preview
```

### Formulário de contato (e-mail)

Leads do formulário vão para `priimesec@gmail.com` via [Resend](https://resend.com).

1. Copie `.env.example` → `.env` e preencha `NUXT_RESEND_API_KEY`.
2. Em produção, verifique o domínio no Resend e defina `NUXT_CONTACT_FROM_EMAIL` (ex.: `PrimeSec <contato@primesec.com.br>`).
3. Defina `NUXT_CONTACT_HMAC_SECRET` (≥ 16 caracteres).

Sem API key em `pnpm dev`, o POST ainda retorna sucesso e só registra no log.
