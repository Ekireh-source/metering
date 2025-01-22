import decimal
import logging
import random
import string
import uuid
# from cities.models import Country # noqa
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.core.validators import RegexValidator
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
# from django.utils.translation import ugettext_lazy as _
from phonenumber_field.modelfields import PhoneNumberField
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.managers import CustomUserManager
from django.db.models import Sum

logger = logging.getLogger(__name__)


def generate_secure_random_int(upper=10):
    """
    Returns a random integer between 0 (inclusive) and upper (exclusive)
    generated using the OS' random number sources.
    """
    return random.SystemRandom().randrange(upper)


# def generate_verification_code():
#     return "".join(
#         [
#             "{}".format(generate_secure_random_int(10))
#             for num in range(PhoneVerificationCode.CODE_LENGTH)
#         ]
#     )


def generate_random_string(length):
    # Define the character set excluding 'i' and '0'
    characters = string.ascii_uppercase.replace('i', '').replace('O', '') + '123456789'

    # Generate the random string
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string


class TimestampMixin(models.Model):
    """
    Model mixin that provides timestamping fields.
    """

    create_date = models.DateTimeField("date created", auto_now_add=True)
    modify_date = models.DateTimeField("date modified", auto_now=True)

    class Meta:
        abstract = True


class User(TimestampMixin, AbstractUser):
    """
    Model class that extends the default User model
    """


    # Roles
    ADMIN = "ADMIN"
    CLIENT = "CLIENT"
   

    USER_ROLES = [
        (ADMIN, _("admin")),
        (CLIENT, _("client"))
        
    ]

    MALE = "MALE"
    FEMALE = "FEMALE"

    USER_GENDER = [
        (MALE, _("male")),
        (FEMALE, _("female"))
    ]

    

    username = None
    email = models.EmailField(_("email_address"), unique=True)
    phone_number = PhoneNumberField(_("phone_number"), unique=True)
    # country = models.ForeignKey(
    #     Country, on_delete=models.CASCADE, null=True, blank=True
    # )
    account_is_active = models.BooleanField(default=False)
    user_role = models.CharField(default=CLIENT, choices=USER_ROLES, max_length=8)
    gender = models.CharField(max_length=6, choices=USER_GENDER, default=MALE)
    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = []
    objects = CustomUserManager()

    def __str__(self):
        """
        Returns a string representation of the User.
        """
        return f"{self.first_name} {self.last_name} {self.email}, {self.phone_number}"

    @property
    def tokens(self):
        refresh = RefreshToken.for_user(self)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }


    @property
    def is_verified(self):
        return self.profile.email_verified





class SettingsConfirmationEmailCode(TimestampMixin):

    USED = "USED"
    ACTIVE = "ACTIVE"

    STATUS_CHOICES = [
        (USED, _("used")),
        (ACTIVE, _("active"))
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    email = models.EmailField(_("email_address"))
    code = models.TextField(_("code"))

    status = models.CharField(
        choices=STATUS_CHOICES, default=ACTIVE, max_length=10
    )


class Profile(TimestampMixin, models.Model):
    """Model class to handle user profiles"""

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    email_verified = models.BooleanField(default=False)
    id_image = models.URLField(null=True, blank=True)

    def __str__(self):
        """
        Returns a string representation of the profile.
        """
        return f"{self.user.email}"


class Wallet(TimestampMixin):
    wallet_id = models.CharField(
        null=False, blank=False, max_length=10, unique=True
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=False)
    currency = models.CharField(
        default="USD", max_length=10
    )
    balance = models.DecimalField(
        default=0.00, max_digits=20, decimal_places=2
    )

    def __str__(self):
        return f"{self.wallet_id} - {self.currency}"

    def add_funds(self, transaction):
        logger.info(
            f"Adding funds. Details: {transaction.get_logging_context()}"
        )

        blc = decimal.Decimal(self.balance)
        self.balance = blc + decimal.Decimal(transaction.amount)
        self.save()
        WalletLog.objects.create(
            wallet=self,
            current_amount=blc,
            incoming_amount=transaction.amount,
        )

    def deduct_funds(self, amount):
        # log this operation
        blc = decimal.Decimal(self.balance)
        if blc < amount:
            raise ValidationError("Insufficient account balance")

        self.balance = blc - amount
        self.save()
        # TODO notify_user

    def get_logging_context(self):
        return {
            "wallet_id": self.wallet_id,
            "currency": self.currency,
            "balance": self.balance,
        }

    @property
    def total_earnings(self):
        from meter.models import Transaction, COMMISSION
        total = Transaction.objects.filter(wallet=self, flow_type=COMMISSION).aggregate(Sum('amount', default=0))
        logger.info(f"[ACCOUNT_MODELS] total_earnings: {total.get('amount__sum')}")
        return total.get('amount__sum')


class WalletLog(TimestampMixin):
    wallet = models.ForeignKey(Wallet, on_delete=models.CASCADE)
    current_amount = models.DecimalField(
        default=0.00, max_digits=20, decimal_places=2, null=True
    )
    incoming_amount = models.DecimalField(
        default=0.00, max_digits=20, decimal_places=2, null=True, blank=True
    )
    outgoing_amount = models.DecimalField(
        default=0.00, max_digits=20, decimal_places=2, null=True, blank=True
    )

