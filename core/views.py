from django.shortcuts import render
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
