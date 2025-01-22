from django.urls import path
from .views import SendUnitsView, ReceiveUnitsView




urlpatterns = [
    path('send-units/', SendUnitsView.as_view(), name="send-units"),
    path('receive-units/', ReceiveUnitsView.as_view(), name="receive-units")
]