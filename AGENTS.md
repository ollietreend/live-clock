# Agent Notes

## Service worker cache

Any time `index.html`, `manifest.json`, a font file, or any other precached asset is modified, the cache version in `service-worker.js` **must** be bumped — otherwise returning visitors will continue to receive stale files.

- Cache version is defined on line 1 of `service-worker.js`: `const CACHE_NAME = 'live-clock-vN';`
- Increment `N` by 1
- Also update `PRECACHE_URLS` if any files have been added, removed, or renamed

## Font

The font is self-hosted and subsetted. Do not replace it with a Google Fonts `<link>` — the app must work fully offline from first load.

- Font file: `fonts/BebasNeue-Regular-subset.woff2`
- Subset contains only: digits `0–9` and colon `:`
- If the font needs to be re-subsetted, use `pyftsubset` from the `fonttools` package:
  ```
  pyftsubset BebasNeue-Regular.woff2 --unicodes="U+0030-0039,U+003A" --flavor=woff2 --output-file=BebasNeue-Regular-subset.woff2
  ```

## Interactive rebase

The gitconfig uses a custom interactive sequence editor (`rebase-editor`). When scripting a rebase, override it to avoid hanging:

```
GIT_SEQUENCE_EDITOR="sed -i '' '...'" git rebase -i <ref>
```
