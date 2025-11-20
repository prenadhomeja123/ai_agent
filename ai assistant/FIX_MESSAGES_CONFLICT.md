# Fix: Application labels aren't unique, duplicates: messages

## The Problem
Python has a built-in `messages` module, and we also created a Django app called `messages`. This causes a conflict.

## Solution Applied

I've updated the app configuration to use a different label:

1. **Updated `messages/apps.py`** - Added `label = 'user_messages'`
2. **Updated `settings.py`** - Changed to use full app config path

## What Changed

### Before:
```python
# settings.py
'messages',  # Conflicts with Python's messages module
```

### After:
```python
# settings.py
'messages.apps.MessagesConfig',  # Uses full path with custom label
```

### apps.py:
```python
class MessagesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'messages'
    label = 'user_messages'  # Different label to avoid conflict
```

## Now Try Again

```bash
python manage.py makemigrations
python manage.py migrate
```

This should work now! The app will be registered as `user_messages` internally, avoiding the conflict.

