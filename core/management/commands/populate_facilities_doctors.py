from django.core.management.base import BaseCommand
from core.models import Hospital, Doctor
import random


class Command(BaseCommand):
    help = 'Populate hospitals with facility data and doctors'

    def handle(self, *args, **kwargs):
        hospitals = Hospital.objects.all()
        
        if not hospitals.exists():
            self.stdout.write(self.style.WARNING('No hospitals found. Please add hospitals first.'))
            return
        
        # Facility templates based on hospital type
        facility_templates = {
            'government': {
                'total_beds': (200, 500),
                'icu_beds': (20, 50),
                'emergency_beds': (30, 80),
                'facilities': {
                    'xray': True,
                    'mri': True,
                    'ct_scan': True,
                    'ultrasound': True,
                    'blood_bank': True,
                    'laboratory': True,
                    'pharmacy': True,
                    'ambulance': True,
                    'operation_theaters': random.randint(5, 12)
                }
            },
            'premium': {
                'total_beds': (100, 300),
                'icu_beds': (15, 40),
                'emergency_beds': (20, 50),
                'facilities': {
                    'xray': True,
                    'mri': True,
                    'ct_scan': True,
                    'ultrasound': True,
                    'blood_bank': True,
                    'laboratory': True,
                    'pharmacy': True,
                    'ambulance': True,
                    'operation_theaters': random.randint(8, 15)
                }
            },
            'private': {
                'total_beds': (50, 200),
                'icu_beds': (10, 30),
                'emergency_beds': (10, 40),
                'facilities': {
                    'xray': True,
                    'mri': random.choice([True, False]),
                    'ct_scan': random.choice([True, False]),
                    'ultrasound': True,
                    'blood_bank': True,
                    'laboratory': True,
                    'pharmacy': True,
                    'ambulance': True,
                    'operation_theaters': random.randint(3, 8)
                }
            },
            'trust': {
                'total_beds': (80, 250),
                'icu_beds': (12, 35),
                'emergency_beds': (15, 50),
                'facilities': {
                    'xray': True,
                    'mri': True,
                    'ct_scan': random.choice([True, False]),
                    'ultrasound': True,
                    'blood_bank': True,
                    'laboratory': True,
                    'pharmacy': True,
                    'ambulance': True,
                    'operation_theaters': random.randint(4, 10)
                }
            },
        }
        
        # Doctor templates
        doctor_templates = [
            {'name': 'Rajesh Kumar', 'qualification': 'MBBS, MD (General Medicine)', 'specialization': 'General Physician', 'experience': (5, 15)},
            {'name': 'Priya Sharma', 'qualification': 'MBBS, MS (General Surgery)', 'specialization': 'General Surgeon', 'experience': (8, 20)},
            {'name': 'Amit Patel', 'qualification': 'MBBS, MD (Cardiology)', 'specialization': 'Cardiologist', 'experience': (10, 25)},
            {'name': 'Sneha Desai', 'qualification': 'MBBS, MD (Pediatrics)', 'specialization': 'Pediatrician', 'experience': (6, 18)},
            {'name': 'Vikram Singh', 'qualification': 'MBBS, MS (Orthopedics)', 'specialization': 'Orthopedic Surgeon', 'experience': (12, 28)},
            {'name': 'Anjali Mehta', 'qualification': 'MBBS, MD (Dermatology)', 'specialization': 'Dermatologist', 'experience': (7, 16)},
            {'name': 'Suresh Reddy', 'qualification': 'MBBS, DM (Neurology)', 'specialization': 'Neurologist', 'experience': (15, 30)},
            {'name': 'Kavita Joshi', 'qualification': 'MBBS, MD (Gynecology)', 'specialization': 'Gynecologist', 'experience': (9, 22)},
            {'name': 'Rahul Verma', 'qualification': 'MBBS, MD (Radiology)', 'specialization': 'Radiologist', 'experience': (8, 19)},
            {'name': 'Meera Nair', 'qualification': 'MBBS, MD (Anesthesiology)', 'specialization': 'Anesthesiologist', 'experience': (10, 24)},
        ]
        
        consultation_days_options = [
            'Mon-Sat',
            'Mon, Wed, Fri',
            'Tue, Thu, Sat',
            'Mon-Fri',
            'Daily',
            'Mon, Tue, Thu, Fri'
        ]
        
        updated_count = 0
        doctors_created = 0
        
        for hospital in hospitals:
            # Get facility template based on hospital type
            template = facility_templates.get(hospital.hospital_type, facility_templates['private'])
            
            # Update hospital facilities
            total_beds_range = template['total_beds']
            icu_beds_range = template['icu_beds']
            emergency_beds_range = template['emergency_beds']
            
            hospital.total_beds = random.randint(*total_beds_range)
            hospital.icu_beds = random.randint(*icu_beds_range)
            hospital.emergency_beds = random.randint(*emergency_beds_range)
            
            # Copy facilities and randomize operation theaters
            facilities = template['facilities'].copy()
            facilities['operation_theaters'] = random.randint(3, 15)
            hospital.facilities = facilities
            
            hospital.save()
            updated_count += 1
            
            # Create 3-5 doctors per hospital
            num_doctors = random.randint(3, 5)
            selected_doctors = random.sample(doctor_templates, min(num_doctors, len(doctor_templates)))
            
            for idx, doc_template in enumerate(selected_doctors):
                experience = random.randint(*doc_template['experience'])
                
                Doctor.objects.create(
                    hospital=hospital,
                    name=doc_template['name'],
                    qualification=doc_template['qualification'],
                    specialization=doc_template['specialization'],
                    experience_years=experience,
                    is_head_doctor=(idx == 0),  # First doctor is head
                    consultation_days=random.choice(consultation_days_options)
                )
                doctors_created += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully updated {updated_count} hospitals with facility data and created {doctors_created} doctors'
            )
        )
