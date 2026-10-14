import hashlib
import json
import re
from dataclasses import dataclass
from pathlib import Path

DICTIONARY_VERSION = "esdb-1e5b7d3a-v1"
DATA_PATH = Path(__file__).resolve().parent / "data"


@dataclass(frozen=True)
class Dictionary:
    version: str
    guesses: dict[int, frozenset[str]]
    answers: dict[int, tuple[str, ...]]


def read_words(directory, filename, length, checksums):
    data = (directory / filename).read_bytes()
    if hashlib.sha256(data).hexdigest() != checksums[filename]:
        raise ValueError(f"Dictionary checksum mismatch: {filename}")
    words = data.decode("ascii").splitlines()
    if not words or len(words) != len(set(words)):
        raise ValueError(f"Empty or duplicate dictionary entries: {filename}")
    if any(re.fullmatch(rf"[A-Z]{{{length}}}", word) is None for word in words):
        raise ValueError(f"Invalid dictionary entries: {filename}")
    return tuple(words)


def load_dictionaries(data_path=DATA_PATH):
    dictionaries = {}
    for directory in sorted(data_path.iterdir()):
        if not directory.is_dir():
            continue
        metadata = json.loads((directory / "metadata.json").read_text())
        version = metadata["version"]
        if version != directory.name:
            raise ValueError(f"Dictionary version mismatch: {directory.name}")
        guesses = {}
        answers = {}
        for length in range(5, 9):
            guesses[length] = frozenset(
                read_words(directory, f"allowed-{length}.txt", length, metadata["sha256"])
            )
            answers[length] = read_words(
                directory, f"answers-{length}.txt", length, metadata["sha256"]
            )
            if not guesses[length].issuperset(answers[length]):
                raise ValueError(f"Answers missing from accepted guesses: {length}")
        dictionaries[version] = Dictionary(version, guesses, answers)
    if DICTIONARY_VERSION not in dictionaries:
        raise ValueError("Current dictionary is missing")
    return dictionaries
