import os
from django.core.exceptions import ImproperlyConfigured


def get_env_variable(env_variable, default=None, allow_none=False):
    value = os.environ.get(env_variable, default)
    if not value and not allow_none:
        error_msg = "Set the {} environment variable".format(env_variable)
        raise ImproperlyConfigured(error_msg)
    return value
