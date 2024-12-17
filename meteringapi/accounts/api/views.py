import logging
from accounts.tasks import handle_send_email_code, handle_send_email_verification
from utils.email import send_email
from utils.general import generate_numeric_id, get_base_url
from six import text_type
from django.utils.encoding import force_str as force_text
from django.conf import settings
from rest_framework import status, viewsets, mixins
from rest_framework.generics import (
    CreateAPIView,
    GenericAPIView,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from drf_yasg2.utils import swagger_auto_schema
from accounts.api.serializers import (
    CreateUserSerializer,
    LoginSerializer,
    LoginResponseSerializer,
    ResetPasswordConfirmSerializer,
    SettingsSerializer,
    UserConfigSerializer,
    ForgotPasswordSerializer
   
)
from accounts.models import SettingsConfirmationEmailCode, User
from accounts.utils import (
    check_if_in_team,
    handle_post_email_verification,
    validate_user_hash,
    b64decode_hash,
    b64encode_user,
)
from utils.auth import token_generator, reset_password_token_generator
from utils.decorators import (
    class_view_decorator,
    required_fields,
    phone_verification_exempt,
)
from utils.exceptions import CustomAPIException
from django.db import connections
from django.db.utils import OperationalError
from django.db.models import Q

logger = logging.getLogger(__name__)

PASSWORD_RESET_SUBJECT = "Sunrepo: Reset Your Password"


class LoginAPIView(TokenObtainPairView):
    """
    Login API. Expects an email and password
    :returns: access and refresh token
    """

    serializer_class = LoginSerializer

    @swagger_auto_schema(responses={200: LoginResponseSerializer()})
    def post(self, request, *args, **kwargs):
        return super().post(request, *args, **kwargs)


class CreateUserAPIView(CreateAPIView):
    """
    API view for registering a user
    """

    permission_classes = (AllowAny,)
    serializer_class = CreateUserSerializer

    def post(self, request, *args, **kwargs):

        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()

        response_data = {
            "success": True,
            "message": "User registered successfully!",
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


class VerifyEmailAPIView(GenericAPIView):
    """
    API view for verifying a user's email account
    """

    permission_classes = (AllowAny,)

    @required_fields(["uid", "token"])
    def get(self, request):
        error_msg = "Invalid activation link"
        user_hash = request.query_params.get("uid")
        token = request.query_params.get("token")
        try:
            _, user_id = b64decode_hash(user_hash)
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            raise CustomAPIException(message=error_msg)
        except Exception as e:
            logger.exception(
                f"[EMAIL VERIFICATION] Error while decoding user_hash."
                f" Error: {text_type(e)}"
            )
            raise CustomAPIException(message=error_msg)

        if token_generator.check_token(user, token):
            profile = user.profile
            profile.email_verified = True
            profile.save()

            logger.info(
                f"[EMAIL VERIFICATION] Email verified for user {user.id}"
            )

            handle_post_email_verification(user)

            response_data = {
                "message": "User account verified successfully!",
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            raise CustomAPIException(message=error_msg)


@class_view_decorator(phone_verification_exempt)
class UserConfigAPIView(GenericAPIView):
    permission_classes = [
        IsAuthenticated
    ]
    serializer_class = UserConfigSerializer

    def get(self, request):
        user = request.user
        serializer = self.serializer_class(user)
        return Response(serializer.data, status=status.HTTP_200_OK)




class ForgotPasswordAPIView(GenericAPIView):
    serializer_class = ForgotPasswordSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = request.data.get("email")
        message = (
            "Thanks! If there's an account associated with this email. "
            " We'll send password reset instructions immediately."
        )
        response_data = {"message": message}

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist as e:
            logger.exception(
                f"[FORGOT PASSWORD]] User with email {email} does not exist.\n"
                f"Error: {text_type(e)}"
            )
            return Response(response_data, status=status.HTTP_200_OK)

        token = reset_password_token_generator.make_token(user)
        user_hash = b64encode_user(force_text(user.pk))
        url = f"{get_base_url()}/reset-password/?uid={user_hash}&token={token}"
        message = (
            f"You requested for a password reset for your account. "
            f"Please click the link below to continue"
            f"with resetting your password.\n\n{url}\n\n"
            f"If you did not request this, please ignore the email.\n\n"
        )
        logger.info(
            f"[ACCOUNTS] About to send password reset email "
            f"email to user {user.pk}"
        )

        #  trigger with rabbitmq
        sent, message = send_email(
            sender=settings.DEFAULT_EMAIL_SENDER,
            recipients=[user.email],
            subject=PASSWORD_RESET_SUBJECT,
            message=message,
            reply_to=[settings.DEFAULT_EMAIL_SENDER],
        )
        logger.info(
            f"[ACCOUNTS] Password reset. Sent: {sent}, message: {message},"
            f" user: {user.pk}"
        )
        message = (
            "Thanks! If there's an account associated with this email, "
            "we'll send password reset instructions immediately."
        )
        response_data = {
            "message": message,
        }
        return Response(response_data, status=status.HTTP_200_OK)


class ResetPasswordAPIView(GenericAPIView):
    permission_classes = [AllowAny]
    serializer_class = ResetPasswordConfirmSerializer

    @required_fields(["uid", "token"])
    def get(self, request):
        """Method to validate and verify the password reset uid and token"""
        user_hash = request.query_params.get("uid")
        token = request.query_params.get("token")
        user = validate_user_hash(user_hash)
        error_message = "Invalid reset password link!"

        if not user:
            raise CustomAPIException(message=error_message)

        if reset_password_token_generator.check_token(user, token):
            logger.info(
                f"[RESET PASSWORD] Link for user account {user.id} "
                f"verified successfully"
            )
            response_data = {
                "message": "Account and token verified successfully!",
            }
            return Response(response_data, status=status.HTTP_200_OK)
        else:
            raise CustomAPIException(message=error_message)

    @required_fields(["uid", "token"])
    def patch(self, request):
        """Method to update the user's password"""
        user_hash = request.query_params.get("uid")
        token = request.query_params.get("token")
        error_message = "Invalid reset password link!"
        user = validate_user_hash(user_hash)

        if not user:
            raise CustomAPIException(message=error_message)

        if not reset_password_token_generator.check_token(user, token):
            raise CustomAPIException(message=error_message)

        data = request.data
        serializer = self.serializer_class(data=data)
        serializer.is_valid(raise_exception=True)

        user.set_password(data.get("password"))
        user.save()
        logger.info(
            f"[RESET PASSWORD] User {user.id} password reset successfully!"
        )

        return Response(
            {
                "message": "Password reset successfully!",
            },
            status=status.HTTP_200_OK,
        )



    # model = Wallet
    # serializer_class = WalletSerializer
    # permission_classes = [
    #     IsAuthenticated
    # ]

    # def get_queryset(self):
    #     queryset = Wallet.objects.filter(
    #         user__is_active=True,
    #         user=self.request.user,
    #     )
    #     return queryset


class SettingsAPIView(CreateAPIView):
    """
    API view for changing a user settings
    """

    permission_classes = (IsAuthenticated,)
    serializer_class = SettingsSerializer

    def post(self, request, *args, **kwargs):
        try:
            serializer = self.serializer_class(data=request.data, context=request)
            serializer.is_valid(raise_exception=True)
            serializer.save()

            response_data = {
                "success": True,
                "message": "User settings updated successfully!",
            }

            return Response(response_data, status=status.HTTP_201_CREATED)
        except Exception as exc:
            return Response(exc.detail, status=status.HTTP_400_BAD_REQUEST)

    # send an email for verification
    def get(self, request, *args, **kwargs):
        user = request.user

        existing_code = SettingsConfirmationEmailCode.objects.filter(user=user).first()

        if existing_code:
            code = existing_code.code
        else:
            code = generate_numeric_id(6)

            SettingsConfirmationEmailCode.objects.create(
                user=user,
                code=code
            )

        handle_send_email_code.delay(user.id, code)

        response_data = {
            "success": True,
            "message": "Confirmation code sent",
        }

        return Response(response_data, status=status.HTTP_201_CREATED)


class ResendVerificationEmailAPIView(GenericAPIView):
    """
    API view for resending verification emails to users
    """

    permission_classes = (AllowAny,)

    @required_fields(["email"])
    def get(self, request):
        email = request.query_params.get("email")
        logger.info(request.query_params)
        error_msg = "We have encountered an error resending the verification link"
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise CustomAPIException(message=error_msg + f": Does Not Exist : {email}")
        except Exception as e:
            logger.exception(
                f"[EMAIL VERIFICATION] Error while resending an email"
                f" Error: {text_type(e)}"
            )
            raise CustomAPIException(message=error_msg + f" Error: {text_type(e)}")

        # check if the email is verified
        profile = user.profile
        if profile.email_verified:
            error_msg = "Email address is already verified"
            raise CustomAPIException(message=error_msg)

        # send the email now
        handle_send_email_verification.delay(user.id)

        response_data = {
            "message": "Verification email sent successfully!",
        }
        return Response(response_data, status=status.HTTP_200_OK)
