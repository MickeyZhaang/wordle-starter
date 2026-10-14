import json
import shutil
import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from words import DATA_PATH, DICTIONARY_VERSION, load_dictionaries


class DictionaryTests(unittest.TestCase):
    def test_answers_are_accepted_and_each_length_has_broad_coverage(self):
        dictionary = load_dictionaries()[DICTIONARY_VERSION]
        for length in range(5, 9):
            with self.subTest(length=length):
                self.assertGreater(len(dictionary.guesses[length]), 1000)
                self.assertGreaterEqual(len(dictionary.answers[length]), 20)
                self.assertTrue(dictionary.guesses[length].issuperset(dictionary.answers[length]))

    def test_modified_dictionary_fails_at_startup(self):
        with TemporaryDirectory() as directory:
            data = Path(directory) / "data"
            shutil.copytree(DATA_PATH, data)
            target = data / DICTIONARY_VERSION / "allowed-5.txt"
            target.write_text(target.read_text() + "ZZZZZ\n")
            with self.assertRaisesRegex(ValueError, "checksum mismatch"):
                load_dictionaries(data)

    def test_older_dictionary_snapshots_remain_available(self):
        with TemporaryDirectory() as directory:
            data = Path(directory) / "data"
            shutil.copytree(DATA_PATH, data)
            previous = data / "previous-version"
            shutil.copytree(data / DICTIONARY_VERSION, previous)
            metadata_file = previous / "metadata.json"
            metadata = json.loads(metadata_file.read_text())
            metadata["version"] = "previous-version"
            metadata_file.write_text(json.dumps(metadata))
            dictionaries = load_dictionaries(data)
            self.assertEqual(set(dictionaries), {DICTIONARY_VERSION, "previous-version"})
