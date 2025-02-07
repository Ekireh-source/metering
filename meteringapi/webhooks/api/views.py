import logging
from utils.models import TokenValidator
from rest_framework.response import Response
from rest_framework import status
from django.shortcuts import render
from rest_framework.views import APIView
from meter.models import MeterToken, Meter

logger = logging.getLogger(__name__)


class TokenDecryptionView(APIView):


    def post(self, request, *args, **kwargs):
        token_info = request.data
        logger.info(
            f"Token Decryption function called"
        )

        data = TokenValidator(**token_info)
        token = data.token
        meter_no = data.meterNo

        try:
            token = MeterToken.objects.get(token=token)
            meter = Meter.objects.get(meter_no=meter_no)
            if token and meter and token.is_used == False:
                meter.units += token.units
                meter.save()
                token.is_used = True
                token.save()
                response_data = {
                "units": token.units,
                "status": 200

                }
                return Response(response_data, status=status.HTTP_200_OK)
            else:
                response_data = {
                    "message": "Either meter or token not found or Token is Invalid",

                }
                return Response(response_data, status=status.HTTP_200_OK)
        except MeterToken.DoesNotExist:
            message = (
                "Token not found"
            )
            response_data = {
                "error": message,
            }
            return Response(response_data, status=status.HTTP_400_BAD_REQUEST)





        
        
