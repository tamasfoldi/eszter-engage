# Eszter még engage tag?

Egy egyoldalas statikus weboldal, Vercelre készítve.

- **2026.09.21-ig** (a napot is beleértve) nagy **IGEN** jelenik meg.
- **2026.09.22-től** **NEM**, és a háttérképek szürkeárnyalatosak lesznek (szomorúság).
- A háttér minden betöltésnél egy véletlenszerű kép a `public/assets/` mappából.

## Képek hozzáadása

Dobj be bármennyi képet a `public/assets/` mappába (`.jpg`, `.jpeg`, `.png`,
`.webp`, `.avif`, `.gif`, `.svg`). A build lépés automatikusan legenerálja a
`public/assets/manifest.json` fájlt, így nem kell kódot módosítani.

A repóban jelenleg 4 `placeholder-*.svg` gradiens van — ezeket bátran töröld,
amikor beteszed az igazi képeket.

## Helyi futtatás

```bash
npm run dev      # legenerálja a manifestet és elindít egy statikus szervert
```

Vagy csak a manifest:

```bash
npm run build
```

## Deploy Vercelre

A `vercel.json` már be van állítva (`buildCommand` + `outputDirectory: public`),
framework preset nem kell.

```bash
npx vercel        # preview deploy
npx vercel --prod # production deploy
```

Vagy pushold egy GitHub repóba, és importáld a Vercel dashboardon.

## A dátum átállítása

A váltás pillanata a [public/script.js](public/script.js) `CUTOFF` konstansa
(`2026-09-22T00:00:00+02:00`, budapesti idő szerint a 21-e vége).
