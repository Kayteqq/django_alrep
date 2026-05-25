from django.utils import timezone
from datetime import timedelta
from .models import Order

EXPIRATION_TIME = 7
DELETION_TIME = 90

def expire_old_order():
    expiration_date = timezone.now() - timedelta(days=EXPIRATION_TIME)
    delete_date = timezone.now() - timedelta(days=DELETION_TIME)

    updated = Order.objects.filter(
        status='pending',
        created_at__lte=expiration_date,
    ).update(status='expired')

    Order.objects.filter(
        status=['expired','failed','canceled'],
        updated_at__lte=delete_date,
    ).delete()