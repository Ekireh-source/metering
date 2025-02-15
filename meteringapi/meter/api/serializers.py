import logging
from rest_framework import serializers
from meter.models import Meter, MeterToken





class SendUnitSerializer(serializers.ModelSerializer):

    receiver_meter_no = serializers.CharField(required=True)
    no_units = serializers.CharField(required=True)
    message = serializers.CharField(required=True)
    
    class Meta:
        model= Meter
        fields = [
            "receiver_meter_no",
            "no_units",
            "message"
        ]

class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = MeterToken
        fields = '__all__'
