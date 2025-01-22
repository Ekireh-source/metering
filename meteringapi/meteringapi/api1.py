from django.urls import include, path

urlpatterns = [
    path(
        "auth/",
        include(("accounts.api.urls", "auth"), namespace="auth"),
    ),
    path(
        "meter/",
        include(
            ("meter.api.urls", "meter"), namespace="meter"
        ),
    )
]
