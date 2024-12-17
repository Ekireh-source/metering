from django.urls import include, path

urlpatterns = [
    path(
        "auth/",
        include(("accounts.api.urls", "app"), namespace="app"),
    ),
    # path(
    #     "documents/",
    #     include(
    #         ("transactions.api.urls", "transactions"), namespace="transactions"
    #     ),
    # )
]
