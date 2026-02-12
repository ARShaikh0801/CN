from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/analyze', views.analyze_symptoms, name='analyze'),
    path('api/hospitals', views.search_hospitals, name='hospitals'),
    path('hospitals/', views.all_hospitals, name='all_hospitals'),
    path('hospitals/<int:pk>/', views.hospital_detail, name='hospital_detail'),
]
