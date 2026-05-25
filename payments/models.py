import uuid
from django.db import models


class Order(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('paid', 'Paid'),
        ('failed', 'Failed'),
        ('canceled', 'Canceled'),
        ('expired', 'Expired'),
    )

    # Używamy UUID jako klucza głównego (zamiast standardowego auto-id)
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Podstawowe dane do filtrowania
    customer_email = models.EmailField()
    status = models.CharField(max_length=255, choices=STATUS_CHOICES, default='pending')
    stripe_payment_intent = models.CharField(max_length=255, blank=True, null=True)

    # Koszty (warto trzymać jako DecimalField, a nie w JSON, aby móc po nich sortować/sumować w bazie)
    subtotal_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    delivery_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    # Dane zapisywane w JSON
    client_data = models.JSONField(default=dict, blank=True)
    delivery_data = models.JSONField(default=dict, blank=True)
    products_data = models.JSONField(default=list, blank=True)  # Zapisujemy tu tablicę z produktami

    # Daty (created_at zastępuje Twoje pole 'date')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Order {self.id} - {self.customer_email} ({self.status})"