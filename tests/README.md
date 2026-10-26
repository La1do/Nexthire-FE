# Frontend regression tests

Run from the FE repo root using existing Node/npm. No dependencies were added.

| Feature | Focused regressions | Synthetic browser regressions |
| --- | --- | --- |
| AI1 evidence/source labels | npm run test:ai1-ui (15) | npm run test:ai1-browser (22) |
| JD requirement plan | npm run test:jd-plan (10) | npm run test:jd-plan-browser (17) |
| Evidence-only matching lifecycle | npm run test:matching-runtime (19) | npm run test:matching-browser (23) |

npm test runs all 44 Node/TypeScript/React SSR checks. Each feature folder keeps its browser runner and TSX harness together. AI1's ten synthetic worker projections are in ai1/fixtures/ai1-hr-review.synthetic.json; other fixtures are inline synthetic data.

Browser suites use local headless Chrome/CDP, mocked Axios and a temporary Vite server. These cover current features and remain durable regressions. They do not verify live JWT/gateway/backend/database E2E. Chrome defaults to C:/Program Files/Google/Chrome/Application/chrome.exe; set AI1_TEST_CHROME to override. Run browser commands sequentially. Scoped profiles and screenshots use ignored node_modules/.tmp; profiles are cleaned in finally blocks.

Cleanup-006 moved flat tests into feature folders and updated package scripts, SSR loaders, TSX imports and browser harness URLs. Historical handoffs use the former flat paths; use these commands now. Screenshot evidence and its relative-path/SHA-256/byte manifest are outside the hub and all repos: D:/Project/NexHire Archive/cleanup-006/frontend/manifest.json. No env, dependencies or profile data are archived.

Run npm run build after source/config changes. Independent Tester verification is separate from developer self-checks.
