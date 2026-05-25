# utils.py
from ..models import Order

def add_order_to_db(checkout_data, products, prices):
    """
    Formatuje dane z sesji i tworzy obiekt Order w bazie danych.
    """
    main_data = checkout_data.get('mainData', {})
    sub_data = checkout_data.get('subData', {})

    # 1. Przygotowanie danych klienta
    client = {
        'first_name': main_data.get('first_name', ''),
        'last_name': main_data.get('last_name', ''),
        'phone': main_data.get('phone', ''),
        'city': main_data.get('city', ''),
        'postal_code': main_data.get('postal_code', ''),
        'address_line_1': main_data.get('address_line_1', ''),
    }
    if main_data.get('company'):
        client['company'] = main_data['company']
    if main_data.get('address_line_2'):
        client['address_line_2'] = main_data['address_line_2']

    # 2. Przygotowanie danych dostawy
    delivery = {
        'first_name': sub_data.get('first_name', ''),
        'last_name': sub_data.get('last_name', ''),
        'phone': sub_data.get('phone', ''),
        'city': sub_data.get('city', ''),
        'postal_code': sub_data.get('postal_code', ''),
        'address_line_1': sub_data.get('address_line_1', ''),
    }
    if sub_data.get('company'):
        delivery['company'] = sub_data['company']
    if sub_data.get('address_line_2'):
        delivery['address_line_2'] = sub_data['address_line_2']

    # 3. Zapis do bazy
    order = Order.objects.create(
        customer_email=main_data.get('email', 'brak_emaila@w_sesji.com'),
        subtotal_price=prices.get('subtotal_price', 0),
        tax=prices.get('tax', 0),
        delivery_price=prices.get('delivery', 0),
        total_price=prices.get('total_price', 0),
        client_data=client,
        delivery_data=delivery,
        products_data=products,
        status='pending'
    )

    return order