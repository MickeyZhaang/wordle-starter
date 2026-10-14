import logging
import os
import sqlite3
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Annotated
from uuid import UUID

from fastapi import FastAPI, Query, Request, Response
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

import game
import storage
from schemas import ErrorResponse, GameHistoryResponse, GameResponse, GuessRequest, NewGameRequest
from words import load_dictionaries

logger = logging.getLogger(__name__)


def error_response(status_code, code, message):
    return JSONResponse(
        status_code=status_code,
        content={"error": {"code": code, "message": message}},
    )


def create_app(database_path=None):
    database_path = Path(
        database_path
        or os.environ.get("WORDLE_DATABASE_PATH", Path(__file__).resolve().parent / "var/wordle.db")
    )

    @asynccontextmanager
    async def lifespan(app):
        app.state.dictionaries = load_dictionaries()
        storage.initialize(database_path)
        yield

    app = FastAPI(
        title="Wordle API",
        version="1.0.0",
        lifespan=lifespan,
        responses={
            404: {"model": ErrorResponse},
            409: {"model": ErrorResponse},
            422: {"model": ErrorResponse},
            503: {"model": ErrorResponse},
        },
    )
    origins = os.environ.get("WORDLE_CORS_ORIGINS", "http://localhost:5173")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[origin.strip() for origin in origins.split(",") if origin.strip()],
        allow_methods=["GET", "POST"],
        allow_headers=["Content-Type"],
    )

    @app.exception_handler(game.GameError)
    async def handle_game_error(request: Request, error: game.GameError):
        return error_response(error.status_code, error.code, error.message)

    @app.exception_handler(RequestValidationError)
    async def handle_validation_error(request: Request, error: RequestValidationError):
        return error_response(422, "invalid_request", "Request does not match the API schema.")

    @app.exception_handler(sqlite3.OperationalError)
    async def handle_storage_error(request: Request, error: sqlite3.OperationalError):
        logger.error("Database operation failed", exc_info=error)
        return error_response(
            503, "storage_unavailable", "Game storage is temporarily unavailable."
        )

    @app.get("/")
    def read_root():
        return {"message": "Wordle API", "docs": "/docs"}

    @app.get("/health")
    def health_check():
        with storage.connect(database_path) as connection:
            connection.execute("SELECT id FROM games LIMIT 1").fetchone()
        return {"status": "healthy"}

    @app.post(
        "/games",
        status_code=201,
        response_model=GameResponse,
        response_model_exclude_none=True,
    )
    def new_game(body: NewGameRequest, request: Request, response: Response):
        result = game.create_game(
            database_path,
            request.app.state.dictionaries,
            body.word_length,
            str(body.player_id),
        )
        response.headers["Location"] = f"/games/{result.id}"
        return result

    @app.get(
        "/games/{game_id}",
        response_model=GameResponse,
        response_model_exclude_none=True,
    )
    def get_game(game_id: UUID, request: Request):
        return game.retrieve_game(database_path, request.app.state.dictionaries, str(game_id))

    @app.post(
        "/players/{player_id}/games/{game_id}",
        response_model=GameResponse,
        response_model_exclude_none=True,
    )
    def attach_game(player_id: UUID, game_id: UUID, request: Request):
        return game.attach_game(
            database_path,
            request.app.state.dictionaries,
            str(player_id),
            str(game_id),
        )

    @app.get(
        "/players/{player_id}/games",
        response_model=GameHistoryResponse,
        response_model_exclude_none=True,
    )
    def list_games(
        player_id: UUID,
        limit: Annotated[int, Query(ge=1, le=50)] = 20,
        cursor: UUID | None = None,
    ):
        return game.list_games(
            database_path,
            str(player_id),
            limit,
            str(cursor) if cursor else None,
        )

    @app.post(
        "/games/{game_id}/guesses",
        response_model=GameResponse,
        response_model_exclude_none=True,
    )
    def guess(game_id: UUID, body: GuessRequest, request: Request):
        return game.submit_guess(
            database_path,
            request.app.state.dictionaries,
            str(game_id),
            body.word,
            body.expected_version,
        )

    return app


app = create_app()
