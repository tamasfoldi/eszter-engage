# Eszter még engage tag?

Egy egyoldalas statikus weboldal, Vercelre készítve.

- **2026.09.21-ig** (a napot is beleértve) nagy **IGEN** jelenik meg.
- **2026.09.22-től** **NEM**, és a háttérképek szürkeárnyalatosak lesznek (szomorúság).
- A háttér minden betöltésnél egy véletlenszerű kép a `public/assets/` mappából.

## Képek hozzáadása

Dobj be bármennyi képet az `images/` mappába (`.jpg`, `.png`, `.webp`,
`.heic`, `.tif`). Ezek az eredeti, nagy felbontású fájlok — a böngészőbe
soha nem ezek kerülnek.

A build ([scripts/build-images.mjs](scripts/build-images.mjs)) minden képből
legenerál egy méretsorozatot (640 / 960 / 1280 / 1600 / 1920 / 2560 px széles
WebP + JPEG) a `public/assets/` mappába, és mellé egy `manifest.json`-t.
A `public/assets/` mappa nincs verziókezelve, mert generált tartalom.

## Melyik méret melyik eszközre?

A [public/script.js](public/script.js) betöltéskor kiszámolja, milyen széles
képre van valójában szükség (`background-size: cover` mellett egy magas
telefonképernyő a kép szélességének nagy részét levágja), és a legkisebb
elég nagy méretet töltí le:

| Eszköz | Letöltött méret |
| --- | --- |
| iPhone 15 (portré) | 1280 px, ~240 KB |
| iPhone 15 (fekvő) | 960 px, ~140 KB |
| Laptop 1440x900 | 1600 px, ~380 KB |
| MacBook / iPad (retina) | 2560 px, ~860 KB |

Az eredeti fájlok ~5 MB-osak, szóval ez telefonon kb. 20x kevesebb adat.

Telefonon 1x képpont-sűrűséggel számolunk, nagyobb kijelzőn max. 2x-szel —
egy sötét fátyol alatti háttérképnek nincs szüksége retina élességre. Ha a
böngésző adattakarékos módot vagy lassú (2G/3G) kapcsolatot jelez, mindig
1x-et kap.

## Helyi futtatás

```bash
npm run dev      # legenerálja a képvariánsokat és elindít egy statikus szervert
```

Vagy csak a képek legenerálása:

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
