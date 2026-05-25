import json
from django.core.mail import EmailMessage
from home.models import ShopSettings


def send_order_confirmation_emails(order):
    shop_settings = ShopSettings.objects.first()

    if not shop_settings:
        print("Błąd: Brak ustawień ShopSettings w bazie. Maile nie zostały wysłane.")
        return

    client_text = json.dumps(order.client_data, indent=4, ensure_ascii=False)
    delivery_text = json.dumps(order.delivery_data, indent=4, ensure_ascii=False)
    products_text = json.dumps(order.products_data, indent=4, ensure_ascii=False)

    # 3. Treść dla ALREP (Wszystkie dane)
    alrep_body = f"""
New Paid Order: {order.id}
Client's email: {order.customer_email}

--- Costs ---
Partial Cost: £{order.subtotal_price}
Taxt: £{order.tax}
Delivery: £{order.delivery_price}
Total Price: £{order.total_price}

--- CLIENT DATA ---
{client_text}

--- DELIVERY DATA ---
{delivery_text}

--- PRODUCTS ---
{products_text}
"""

    # 4. Treść dla ARGO (Tylko produkty)
    argo_body = f"""
Zamówienie: {order.id}
Poniżej znajduje się lista produktów do realizacji:

{products_text}
"""

    # 5. Wysyłka do ALREP
    try:
        EmailMessage(
            subject=f'Nowe zamówienie - kompletne dane ({order.id})',
            body=alrep_body,
            from_email=None,  # Użyje domyślnego adresu z settings.py (DEFAULT_FROM_EMAIL)
            to=[shop_settings.alrep_mail],
        ).send(fail_silently=False)
        print("Wysłano maila do ALREP.")
    except Exception as e:
        print(f"Błąd wysyłki do ALREP: {e}")

    # 6. Wysyłka do ARGO
    try:
        EmailMessage(
            subject=f'Nowe zamówienie - do realizacji ({order.id})',
            body=argo_body,
            from_email=None,
            to=[shop_settings.argo_mail],
        ).send(fail_silently=False)
        print("Wysłano maila do ARGO.")
    except Exception as e:
        print(f"Błąd wysyłki do ARGO: {e}")