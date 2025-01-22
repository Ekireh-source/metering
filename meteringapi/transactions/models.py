from django.db import models
from accounts.models import TimestampMixin, User
from meter.models import Meter
from django.utils.translation import gettext_lazy as _

# Create your models here.

IN = "IN"
OUT = "OUT"

DIRECTION_CHOICES = [
    (IN, _("In")),
    (OUT, _("Out"))
]

PENDING = "PENDING"
COMPLETED = "COMPLETED"
FAILED = "FAILED"

STATUS_CHOICES = [
    (PENDING, _("Pending")),
    (COMPLETED, _("Completed")),
    (FAILED, _("Failed"))
]

class UnitTransaction(TimestampMixin):
    """
    Model for tracking unit transactions (sharing or transferring units between users/devices)
    """
    transaction_id = models.CharField(max_length=16, unique=True, null=True, blank=True)
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_transactions')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_transactions')
    units = models.FloatField()  # Amount of units transferred
    meter = models.ForeignKey(Meter, on_delete=models.SET_NULL, null=True, blank=True)
    direction = models.CharField(
        choices=DIRECTION_CHOICES, default=IN, max_length=3
    )
    status = models.CharField(
        choices=STATUS_CHOICES, default=PENDING, max_length=20
    )
    message = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Transaction {self.transaction_id} from {self.sender.username}"
