from accounts.api.views import (
    CreateUserAPIView,
    ResendVerificationEmailAPIView,
    ResetPasswordAPIView,
    SettingsAPIView,
    VerifyEmailAPIView,
    LoginAPIView,
    ForgotPasswordAPIView,
    UserConfigAPIView,
  
)
from django.urls import path, include

from rest_framework_simplejwt.views import (
    TokenRefreshView,
)

urlpatterns = [
    path("register/", CreateUserAPIView.as_view(), name="register"),
    path(
        "verify-email/",
        view=VerifyEmailAPIView.as_view(),
        name="verify_email",
    ),
    path("login/", LoginAPIView.as_view(), name="login"),
    path("refresh/token/", TokenRefreshView.as_view(), name="refresh_token"),
    path(
        "get-user-config/",
        view=UserConfigAPIView.as_view(),
        name="get_user_config",
    ),

   
    path(
        "forgot-password/",
        view=ForgotPasswordAPIView.as_view(),
        name="forgot_password",
    ),
    path(
        "reset-password/",
        view=ResetPasswordAPIView.as_view(),
        name="reset_password",
    ),
    path(
        "resend-email-link/",
        view=ResendVerificationEmailAPIView.as_view(),
        name="resend-email-link",
    ),
    path(
        "security-code/",
        view=SettingsAPIView.as_view(),
        name="security-code",
    ),
   
]
