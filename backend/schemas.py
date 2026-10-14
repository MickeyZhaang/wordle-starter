from typing import Annotated, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


class NewGameRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    word_length: Annotated[int, Field(alias="wordLength", strict=True, ge=5, le=8)]


class GuessRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    word: Annotated[str, Field(strict=True, min_length=5, max_length=8, pattern=r"^[A-Za-z]+$")]
    expected_version: Annotated[int, Field(alias="expectedVersion", strict=True, ge=0, le=9)]

    @field_validator("word")
    @classmethod
    def normalize_word(cls, word: str) -> str:
        return word.upper()


class GuessResponse(BaseModel):
    word: str
    evaluation: list[Literal["correct", "present", "absent"]]


class GameResponse(BaseModel):
    id: UUID
    word_length: int = Field(serialization_alias="wordLength")
    max_attempts: int = Field(serialization_alias="maxAttempts")
    status: Literal["active", "won", "lost"]
    version: int
    guesses: list[GuessResponse]
    answer: str | None = None


class ErrorDetail(BaseModel):
    code: str
    message: str


class ErrorResponse(BaseModel):
    error: ErrorDetail
