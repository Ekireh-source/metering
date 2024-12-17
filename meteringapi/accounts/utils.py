import logging
import re
from base64 import urlsafe_b64decode, urlsafe_b64encode
from datetime import timedelta
from typing import Tuple, Union
from django.conf import settings
from django.utils import timezone
from six import text_type
from accounts.models import (
    User,
    generate_random_string
)
from utils.general import bytes2str


logger = logging.getLogger(__name__)
ENCODED_HASH_PATTERN = r"(?:[\w\d+/]{4})*(?:[\w\d+/]{2}==|[\w\d+/]{3}=)?"
HASH_PATTERN = "user:[0-9]*"


def b64encode_user(user_id):
    """
    returns urlsafe b64 encoded pattern given user id

    :param user_id: id of accounts.User
    :type user_id: int

    :returns: str used as user_hash
    """
    encoded = bytes2str(urlsafe_b64encode, "user:{}".format(user_id))
    return encoded


def b64decode_hash(
    hash_str: str,
) -> Union[Tuple[None, None], Tuple[str, str]]:
    """
    Given a hash that matches , decodes hash and returns
    tuple of the Model and Model.id

    :param hash_str: b64encoded string matching HASH_PATTERN
    :type org_hash: str

    :returns: tuple ('user', object_id)
    """
    if not re.match(ENCODED_HASH_PATTERN, hash_str):
        return None, None

    decoded_bytes = urlsafe_b64decode(text_type(hash_str))
    try:
        decoded_param = decoded_bytes.decode("utf8")
    except UnicodeDecodeError:
        return None, None
    if not re.match(HASH_PATTERN, decoded_param):
        return None, None

    model, model_id = decoded_param.split(":")
    return model, model_id


def get_diff_repr(diff_date):
    """
    Takes date difference and returns a string representation

    :param diff_date: datetime.timedelta(seconds=7656, microseconds=929673)

    :returns: "01 mins, 23 secs"
    """
    diff_seconds = diff_date.total_seconds()
    s = diff_seconds
    m = s // 60
    diff_repr = "%02d mins, %02d secs" % (m % 60, s % 60)
    return diff_repr


def get_should_resend(message):
    """
    Determines whether we should resend a code using the message provider

    :param message: accounts.PhoneVerificationMessage

    :returns: (bool, message)
    """
    BACK_OFF = int(settings.PHONE_VERIFICATION_BACK_OFF_MINUTES)
    now = timezone.now()

    if message.create_date < (now - timedelta(minutes=BACK_OFF)):
        return (True, "")

    diff = message.create_date + timedelta(minutes=BACK_OFF) - now
    diff_repr = get_diff_repr(diff)
    return (False, f"Please try again in {diff_repr}")


def validate_user_hash(user_hash):
    try:
        _, user_id = b64decode_hash(user_hash)
        user = User.objects.get(pk=user_id)
        return user
    except User.DoesNotExist:
        return None
    except Exception as e:
        logger.exception(
            f"[RESET PASSWORD] Error while decoding uid.\n"
            f"Error: {text_type(e)}"
        )
        return None


def handle_post_email_verification(user):
    # activate account

    logger.info(f"[ACCOUNT_ACTIVATION] Activated user account {user.id}")

    # create wallet
    currency = USD

    wallet, created = Wallet.objects.get_or_create(
        user=user, currency=currency
    )
    if created:
        logger.info(f"[ACCOUNT_ACTIVATION] Created wallet {wallet.id}")


def check_if_in_team(upline, origin):
    if not upline:
        return False
    if upline.id < origin.id:
        return False
    elif upline.id == origin.id:
        return True
    else:
        print(f"[SKIPPING] {upline.user_id.email}")
        upline_binary = Binary.objects.filter(user_id=upline.upline_id).first()
        return check_if_in_team(upline_binary, origin)


def activate_admin(admin_id):
    admin_user = User.objects.filter(id=admin_id, email=settings.ADMIN_EMAIL).first()
    if not admin_user:
        raise Exception("Invalid admin user")

    
    admin_user.referral_code = generate_random_string(10)
    admin_user.save()
    return True
