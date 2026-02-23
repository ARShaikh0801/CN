from django.core.management.base import BaseCommand
from core.models import Hospital

class Command(BaseCommand):
    help = 'Update ambulance contacts for hospitals with ambulance service'

    def handle(self, *args, **options):
        hospitals_with_ambulance = Hospital.objects.filter(facilities__ambulance=True)
        updated_count = 0
        
        for hospital in hospitals_with_ambulance:
            if not hospital.ambulance_contact:
                # Use the same contact number for ambulance service
                hospital.ambulance_contact = hospital.contact
                hospital.save()
                updated_count += 1
                self.stdout.write(f"Updated {hospital.name}")
        
        self.stdout.write(self.style.SUCCESS(f'Successfully updated {updated_count} hospitals with ambulance contacts'))
