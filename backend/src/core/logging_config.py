# src/core/logging_config.py
import logging
import sys


def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        stream=sys.stdout,
    )


setup_logging()  # run once at import time
logger = logging.getLogger("app")
