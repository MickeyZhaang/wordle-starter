# Word game frontend

A compact Wordle-style game built with React and Vite. It supports five- through eight-letter
rounds, physical and on-screen keyboard input, sequential result reveals, light and dark themes,
and server-backed game restoration after a reload.

The FastAPI service is authoritative for answers, accepted words, evaluations, game status, and
versioning. The browser stores only the current server game ID and its word length.

## Development

```sh
npm install
npm run dev
```

The frontend uses `http://localhost:8000` by default. Set `VITE_API_URL` to use a different API
origin.

## Checks

```sh
npm run lint
npm run build
```

## Production preview

```sh
npm run build
npm run preview
```
