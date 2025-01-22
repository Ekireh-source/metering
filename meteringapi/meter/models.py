import random
import string
from django.db import models

from accounts.models import User,TimestampMixin


def generate_random_string(length):
    # Define the character set excluding 'i' and '0'
    characters = string.ascii_uppercase.replace('i', '').replace('O', '') + '123456789'

    # Generate the random string
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string


class Meter(TimestampMixin):
    """
    Model for ESP32 Device to store static IP and other device-related information
    """
    meter_no = models.CharField(max_length=100, unique=True)  # Unique identifier for the device
    static_ip = models.GenericIPAddressField()  # Store the static IP
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')  # Link device to a user
    units = models.PositiveIntegerField(default=0)


    def __str__(self):
        return f"{self.meter_no} - IP: {self.static_ip}"


