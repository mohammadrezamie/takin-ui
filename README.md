# takin-ui

Small JavaScript utilities for locale direction and logical placement. No framework, commercial design assets or private code.

## Run locally

\`\`\`sh
node --test direction.test.mjs
\`\`\`

Uses standard-library dependencies only. CI runs this repository's own code and synthetic tests on two standard Linux runner images in parallel. Failed jobs remain visible; no private checkout, cross-repository tokens, deployment, production data or private test artifacts are used.

## Locale and writing-mode helpers

- \`direction(locale)\` resolves a BCP 47 locale's direction using its explicit script when present and a conservative language fallback otherwise.
- \`logicalSide(start|end, ltr|rtl)\` resolves inline edges in horizontal layout.
- \`physicalSide(block-start|block-end|inline-start|inline-end, direction, writingMode)\` resolves logical edges for \`horizontal-tb\`, \`vertical-rl\` and \`vertical-lr\`.

These are pure functions: they do not inspect or mutate DOM, infer CSS \`direction:auto\`, or support sideways writing modes. Prefer CSS logical properties in production stylesheets; use the mapping when a consumer needs a physical-side adapter.

## Integration boundary

This is an independently useful public utility, not a mirror or remote runner for a private application. Consumers should pin a reviewed version and run their own integration checks. A green public CI run certifies only this utility at its tested commit, not any consuming application.

## Status

Initial implementation; not a stable release. Licensing terms are pending owner selection; public visibility alone is not a license to redistribute or modify.
