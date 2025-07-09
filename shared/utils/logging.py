import logging

# Basic logger setup for all services
logger = logging.getLogger("orchestra")
logger.setLevel(logging.INFO)

ch = logging.StreamHandler()
ch.setLevel(logging.INFO)
formatter = logging.Formatter('[%(asctime)s] %(levelname)s in %(module)s: %(message)s')
ch.setFormatter(formatter)
logger.addHandler(ch)

# Utility function example
def get_logger(name: str):
    l = logging.getLogger(name)
    l.setLevel(logging.INFO)
    return l
