from django.db import models

class Hospital(models.Model):
    HOSPITAL_TYPES = [
        ('government', 'Government'),
        ('private', 'Private'),
        ('trust', 'Trust'),
        ('premium', 'Premium'),
        ('unknown', 'Unknown'),
    ]

    name = models.CharField(max_length=255)
    address = models.TextField()
    city = models.CharField(max_length=100)
    pincode = models.CharField(max_length=20)
    lat = models.FloatField()
    lng = models.FloatField()
    contact = models.CharField(max_length=50)
    ambulance_contact = models.CharField(max_length=50, blank=True, null=True)  # Ambulance service contact
    specialities = models.JSONField(default=list)  # Storing list of strings
    hospital_type = models.CharField(max_length=20, choices=HOSPITAL_TYPES, default='private')
    rating = models.FloatField(default=0.0)
    acceptedSchemes = models.JSONField(default=list)  # Storing list of objects {schemeName, schemeId}
    base_cost_factor = models.FloatField(default=1.0)
    
    # Facility Information
    total_beds = models.IntegerField(default=0)
    icu_beds = models.IntegerField(default=0)
    emergency_beds = models.IntegerField(default=0)
    facilities = models.JSONField(default=dict)  # Equipment and services availability
    # Example: {"xray": true, "mri": true, "ct_scan": false, "ultrasound": true, 
    #           "blood_bank": true, "laboratory": true, "pharmacy": true, 
    #           "ambulance": true, "operation_theaters": 5}
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


class Doctor(models.Model):
    hospital = models.ForeignKey(Hospital, on_delete=models.CASCADE, related_name='doctors')
    name = models.CharField(max_length=255)
    qualification = models.CharField(max_length=255)  # e.g., "MBBS, MD (Cardiology)"
    specialization = models.CharField(max_length=255)  # e.g., "Cardiologist"
    experience_years = models.IntegerField(default=0)
    is_head_doctor = models.BooleanField(default=False)
    consultation_days = models.CharField(max_length=255, default="Mon-Sat")  # e.g., "Mon, Wed, Fri"
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.name} - {self.specialization}"

    class Meta:
        ordering = ['-is_head_doctor', 'name']
