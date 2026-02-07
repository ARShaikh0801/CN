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
    specialities = models.JSONField(default=list)  # Storing list of strings
    hospital_type = models.CharField(max_length=20, choices=HOSPITAL_TYPES, default='private')
    rating = models.FloatField(default=0.0)
    acceptedSchemes = models.JSONField(default=list)  # Storing list of objects {schemeName, schemeId}
    base_cost_factor = models.FloatField(default=1.0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name
