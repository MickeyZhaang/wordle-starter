# Wordle API

The FastAPI service creates, retrieves, and advances independent Wordle games. SQLite stores game
state, and a versioned English Speller Database export validates guesses without a runtime network
dependency.

## Local setup

```sh
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
.venv/bin/uvicorn main:app --reload
```

The API is available at `http://localhost:8000`; interactive documentation is available at
`http://localhost:8000/docs`.

`WORDLE_DATABASE_PATH` changes the SQLite path. It defaults to `backend/var/wordle.db`.
`WORDLE_CORS_ORIGINS` accepts a comma-separated origin list and defaults to
`http://localhost:5173`.

## API

Create a game:

```http
POST /games
Content-Type: application/json

{"playerId": "6f59df0d-81fb-4f20-8711-9f15bafcc841", "wordLength": 5}
```

Retrieve a game:

```http
GET /games/{gameId}
```

Submit a guess:

```http
POST /games/{gameId}/guesses
Content-Type: application/json

{"word": "CRANE", "expectedVersion": 0}
```

Successful endpoints return the public game state. The answer is omitted while the game is active
and included after a win or loss. Each accepted guess increments `version`; a submission with an
older `expectedVersion` receives `409 stale_game`.

List a player's games:

```http
GET /players/{playerId}/games?limit=20&cursor={gameId}
```

History is ordered newest first and uses the last game ID from one response as the next request's
cursor. Selecting a game uses `GET /games/{gameId}` to retrieve its latest state. Browser profiles
are anonymous identifiers rather than authenticated accounts.

Errors use a consistent shape:

```json
{
    "error": {
        "code": "invalid_word",
        "message": "Not in word list."
    }
}
```

## Word data

Accepted guesses are generated from the English Speller Database revision recorded in
`data/esdb-1e5b7d3a-v1/metadata.json`. Possible answers are a smaller curated subset. Both are
checked at startup against their recorded SHA-256 hashes, and each stored game records the
dictionary version under which it was created.

## Checks

```sh
.venv/bin/python -m unittest discover -s tests -v
.venv/bin/ruff check .
.venv/bin/ruff format --check .
```
