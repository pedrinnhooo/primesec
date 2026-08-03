# SecFocus

Landing page da SecFocus: consultoria de tecnologia com desenvolvimento e segurança da informação.

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
