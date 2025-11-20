"""
Management command to check and execute scheduled automations
Run this periodically (e.g., via cron) to execute delayed automations

Usage:
    python manage.py run_automations
"""

from django.core.management.base import BaseCommand
from automations.services import check_scheduled_automations


class Command(BaseCommand):
    help = 'Check and execute scheduled automations'

    def handle(self, *args, **options):
        self.stdout.write('Checking scheduled automations...')
        executed_count = check_scheduled_automations()
        self.stdout.write(
            self.style.SUCCESS(f'Successfully executed {executed_count} scheduled automations')
        )

