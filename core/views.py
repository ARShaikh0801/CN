from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from core.models import Hospital
from core.utils.gemini import analyze_symptoms as gemini_analyze
from core.utils.cost import compute_cost_range, format_cost_text
from core.utils.speciality_mapper import normalize_speciality
import json
import re

def index(request):
    return render(request, 'core/index.html')

@csrf_exempt
def analyze_symptoms(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            symptoms_text = data.get('symptoms_text')
            location = data.get('location')
            
            if not symptoms_text:
                return JsonResponse({'error': 'symptoms_text is required'}, status=400)
                
            analysis = gemini_analyze(symptoms_text, location)
            return JsonResponse({'analysis': analysis})
        except Exception as e:
            print(f"Analyze error: {e}")
            return JsonResponse({'error': 'analysis failed'}, status=500)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def search_hospitals(request):
    try:
        speciality = request.GET.get('speciality')
        city = request.GET.get('city')
        disease = request.GET.get('disease')
        budget = request.GET.get('budget')
        
        if not speciality or not city:
            return JsonResponse({'error': 'speciality and city are required'}, status=400)

        normalized_speciality = normalize_speciality(speciality)
        
        # Case-insensitive substring match for city to match original logic regex `^${city}$` 'i'
        # Actually original was exact match case-insensitive
        hospitals = Hospital.objects.filter(
            city__iexact=city,
            specialities__contains=[normalized_speciality] # For JSONField list containment
        ).all()
            
        # If JSONField containment query isn't standard in SQLite/Django for simple lists without specific DB drivers,
        # we might need to filter in python or use specific lookups.
        # SQLite JSON support is decent in modern Django.
        # Let's try standard filter first. If it fails, we fetch all by city and filter in python.
        
        # Fallback if specific DB backend issues:
        # hospitals = Hospital.objects.filter(city__iexact=city)
        # hospitals = [h for h in hospitals if normalized_speciality in h.specialities]
        
        # Since we want to reproduce specific features, relying on DB JSON lookup might be risky if not configured.
        # Let's implement Python filtering for safety on SQLite
        candidates = Hospital.objects.filter(city__iexact=city)
        filtered_hospitals = []
        for h in candidates:
            if normalized_speciality in h.specialities:
                filtered_hospitals.append(h)
                
        enriched_hospitals = []
        for h in filtered_hospitals:
            used_disease = disease if disease else "Dengue"
            cost_data = compute_cost_range(used_disease, city, h)
            
            enriched = {
                'name': h.name,
                'id': h.id,
                'address': h.address,
                'city': h.city,
                'rating': h.rating,
                'hospital_type': h.hospital_type,
                'lat': h.lat,
                'lng': h.lng,
                'map_url': f"https://www.google.com/maps?q={h.lat},{h.lng}" if h.lat and h.lng else None,
                'computed_cost': { 'low': cost_data['low'], 'high': cost_data['high'] },
                'cost_text': format_cost_text(cost_data['low'], cost_data['high'])
            }
            enriched_hospitals.append(enriched)
            
        # Budget filter
        if budget:
            budget_val = float(budget)
            enriched_hospitals = [h for h in enriched_hospitals if h['computed_cost']['low'] <= budget_val]
            
        return JsonResponse({'hospitals': enriched_hospitals})
        

    except Exception as e:
        print(f"Hospital search error: {e}")
        return JsonResponse({'error': 'Failed to fetch hospitals'}, status=500)

def all_hospitals(request):
    try:
        # Get filter parameters
        city_filter = request.GET.get('city')
        type_filter = request.GET.get('type')
        rating_filter = request.GET.get('rating')

        hospitals = Hospital.objects.all()

        if city_filter:
            hospitals = hospitals.filter(city__iexact=city_filter)
        
        if type_filter:
            hospitals = hospitals.filter(hospital_type__iexact=type_filter)
            
        if rating_filter:
            try:
                min_rating = float(rating_filter)
                hospitals = hospitals.filter(rating__gte=min_rating)
            except ValueError:
                pass


        # Get unique values for filters
        cities = Hospital.objects.values_list('city', flat=True).distinct().order_by('city')
        types = Hospital.HOSPITAL_TYPES

        # Enrich hospitals for template
        enriched_hospitals = []
        for h in hospitals:
            # Get facility highlights
            facilities = h.facilities or {}
            key_equipment = []
            if facilities.get('xray'):
                key_equipment.append('X-Ray')
            if facilities.get('mri'):
                key_equipment.append('MRI')
            if facilities.get('ct_scan'):
                key_equipment.append('CT Scan')
            
            enriched_hospitals.append({
                'id': h.id,
                'name': h.name,
                'address': h.address,
                'city': h.city,
                'rating': h.rating,
                'rating_range': range(int(h.rating)) if h.rating else [], # For star loop
                'hospital_type': h.get_hospital_type_display(),
                'type_code': h.hospital_type,
                'lat': h.lat,
                'lng': h.lng,
                'map_url': f"https://www.google.com/maps?q={h.lat},{h.lng}" if h.lat and h.lng else None,
                'specialities': h.specialities[:3], # Show first 3
                'more_specialities_count': len(h.specialities) - 3 if len(h.specialities) > 3 else 0,
                'total_beds': h.total_beds,
                'key_equipment': key_equipment,
                'doctor_count': h.doctors.count(),
                'has_ambulance': facilities.get('ambulance', False),
                'ambulance_contact': h.ambulance_contact
            })


        context = {
            'hospitals': enriched_hospitals,
            'cities': cities,
            'hospital_type_choices': types, 
            'current_filters': {
                'city': city_filter,
                'type': type_filter,
                'rating': rating_filter
            }
        }
        return render(request, 'core/all_hospitals.html', context)
    except Exception as e:
        print(f"Error in all_hospitals: {e}")
        return render(request, 'core/index.html', {'error': 'Failed to load hospitals'})

def hospital_detail(request, pk):
    hospital = get_object_or_404(Hospital, pk=pk)
    
    # Get all doctors for this hospital
    doctors = hospital.doctors.all()
    
    # Context data similar to what's used in cards, but more detailed if available
    context = {
        'hospital': hospital,
        'rating_range': range(int(hospital.rating)) if hospital.rating else [],
        'map_url': f"https://www.google.com/maps?q={hospital.lat},{hospital.lng}" if hospital.lat and hospital.lng else None,
        'hospital_type_label': hospital.get_hospital_type_display(),
        'doctors': doctors,
        'facilities': hospital.facilities or {},
    }
    return render(request, 'core/hospital_detail.html', context)
