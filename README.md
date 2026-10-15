# Wordle Full Stack Assessment

## Assessment Submission Update

This repository contains the completed full-stack Wordle application. The FastAPI backend owns
game rules and durable state, while the React frontend provides the board, keyboard, game history,
and restoration experience.

### Quick start

Start the backend from the repository root:

```bash
docker compose up --build
```

In another terminal, start the frontend:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. The frontend connects to the API at `http://localhost:8000`, and the
interactive API documentation is available at `http://localhost:8000/docs`.

### Architecture

- `frontend/` contains the React UI, shared game reducer, API client, and browser persistence.
- `backend/main.py` configures FastAPI, routes, startup, CORS, and HTTP error handling.
- `backend/schemas.py` defines and validates the API request and response contracts.
- `backend/game.py` coordinates game workflows, transactions, history, and public responses.
- `backend/rules.py` contains the persistence-independent Wordle rules and remaining-word logic.
- `backend/storage.py` owns SQLite connections, schema, queries, and transactions.
- `backend/words.py` loads and verifies versioned accepted-word and answer dictionaries.

Requests flow from the React API client through FastAPI into the game workflow. The workflow uses
the rules module for decisions and the storage module for durable state, then returns a validated
public response to the frontend reducer.

## Background

Wordle is a simple game in which you have to guess a five-letter word. You get six guesses, learning a little more information with each guess, and eventually narrow your guesses down to find the answer.

You can play an online version of Wordle [here](https://www.nytimes.com/games/wordle/index.html).

## Rules

1. Letters that are in the answer and in the right place turn green.
2. Letters that are in the answer but in the wrong place turn yellow.
3. Letters that are not in the answer turn gray.
4. Answers are never plural.
5. Letters can appear more than once. So if your guess includes two of one letter, they may both turn yellow, both turn green, or one could be yellow and the other green.
6. Each guess must be a valid word in Wordle's dictionary. You can't guess ABCDE, for instance.
7. You do not have to include correct letters in subsequent guesses.
8. You have six guesses to solve the Wordle.

## Goal

Your goal is to design and build a full stack Wordle application with both a REST API backend and a React frontend.

In our version of Wordle, there are 2 key differences from the original:

1. **Multiple Games**: The user can create and play as many games as they want.
2. **Configurable Word Length**: The user can configure the number of letters in the target word to be anywhere between 5 to 8 letters, but they will always only have N+1 turns to guess the word. For instance, traditional Wordle involves guessing a five-letter word over six turns, but in our version, the user can pick 7 as the number of letters and get 8 turns to guess the word.

### Backend Requirements

- Build a REST API that supports:
  - Creating a new game (with configurable word length 5-8)
  - Submitting guesses and receiving feedback (green/yellow/gray for each letter)
  - Retrieving game state
  - Validating that guesses are real words
- Use appropriate data storage for game state

### Frontend Requirements

- Build a React UI that allows users to:
  - Start a new game with a selected word length (5-8 letters)
  - Enter guesses via an on-screen keyboard or physical keyboard
  - See feedback for each guess (green/yellow/gray letters)
  - View their guess history for the current game
  - See when they've won or lost

**Use of AI is allowed and encouraged for this assessment.**

---

## Getting Started

This repository includes boilerplate code to help you get started quickly.

### Project Structure

```
wordle-starter/
├── frontend/           # React application (Vite)
├── backend/            # FastAPI application
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── README.md
```

### Frontend

The frontend is a React application built with Vite. It is pre-configured with CORS support to communicate with the backend.

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`.

**Key files to modify:**

- `frontend/src/App.jsx` - Main application component, start building your UI here
- `frontend/src/App.css` - Application styles
- Add new components in `frontend/src/components/` as needed

### Backend

The backend is a FastAPI application with CORS already configured for the frontend. Run it using Docker Compose:

```bash
docker compose up --build
```

This will build and start the backend container with hot-reloading enabled. The API will be available at `http://localhost:8000`.

To run in detached mode (background):

```bash
docker compose up -d --build
```

To stop the container:

```bash
docker compose down
```

API documentation is automatically available at `http://localhost:8000/docs`.

The API persists games in SQLite and supports creating a game, retrieving its public state, and
submitting guesses. See [`backend/README.md`](backend/README.md) for the endpoint contract, local
setup, word-list provenance, and backend checks.

**Key files to modify:**

- `backend/main.py` - Add your API endpoints here
- `backend/requirements.txt` - Add any additional Python dependencies

### Development Workflow

1. Start the backend with `docker compose up --build`
2. Start the frontend with `cd frontend && npm install && npm run dev`
3. Build your API endpoints in `backend/main.py`
4. Build your UI in the `frontend/src/` directory
5. The frontend is configured to make requests to `http://localhost:8000`

### Formatting

Install each application’s formatting tools once:

```bash
npm --prefix frontend install
python3 -m pip install -r backend/requirements-dev.txt
```

VS Code recommends the Prettier and Ruff extensions and formats supported files on save using the
configuration checked into each application. Other editors can use the same application-specific
configuration through their Prettier, EditorConfig, and Ruff integrations.

Format or verify each application from the command line:

```bash
npm --prefix frontend run format
npm --prefix frontend run format:check
python3 -m ruff format backend
python3 -m ruff format --check backend
```
