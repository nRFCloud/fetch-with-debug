# `@nrfcloud/fetch-with-debug`

<https://jsr.io/@nrfcloud/fetch-with-debug>

Simple wrapper around fetch that logs request and response.

## Install with NPM

```bash
npx jsr add (--save-prod|--save-dev) @nrfcloud/fetch-with-debug
```

## Usage

```typescript
import { fetchWithDebug } from "@nrfcloud/fetch-with-debug";

const fetch = fetchWithDebug(
  (type, details) => console.log("[My Service]", type, JSON.stringify(details)),
  (args) => console.error("[My Service]", JSON.stringify(args)),
  (args) => console.debug("[My Service]", JSON.stringify(args)),
);

const res = await fetch(new URL("https://example.com"));
```
