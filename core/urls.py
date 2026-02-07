from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/analyze', views.analyze_symptoms, name='analyze'),
    path('api/hospitals', views.search_hospitals, name='hospitals'),
]
