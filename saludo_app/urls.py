from django.urls import path
from . import views

urlpatterns = [
    path('', views.index, name='index'),
    path('api/mensaje/', views.get_mensaje, name='get_mensaje'),
    path('api/cambiar-mensaje/', views.cambiar_mensaje, name='cambiar_mensaje'),
    path('api/blockchain/', views.get_blockchain, name='get_blockchain'),
    path('api/contract-info/', views.get_contract_info, name='get_contract_info'),
    path('api/events/', views.get_events, name='get_events'),
]
