"""
Development settings with SQLite database
Use this if PostgreSQL setup is causing issues
"""

from .settings import *

# Override database to use SQLite for development
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Note: This is only for development!
# Use PostgreSQL in production

