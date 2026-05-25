from django.urls import path
from .views import create_checkout_session, success_view, cancel_view, stripe_webhook

urlpatterns = [
    path('create-checkout-session/', create_checkout_session, name='checkout'),
    path('success/', success_view, name='success'),
    path('cancel/', cancel_view, name='cancel'),
    path('webhooks/stripe/', stripe_webhook, name='stripe-webhook'),
]