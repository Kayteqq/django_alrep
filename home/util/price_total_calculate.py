from decimal import Decimal


def calculate_total_price(data):
    # 1. Inicjalizujemy sumy jako Decimal zamiast float
    subtotal_price_gbp = Decimal('0.0')
    subtotal_price_pln = Decimal('0.0')

    for product in data:
        # Konwertujemy ceny na Decimal na wypadek, gdyby w słowniku były floatami/stringami
        cost_gbp = Decimal(str(product['prices']['cost_per_unit_gbp']))
        cost_pln = Decimal(str(product['prices']['cost_per_unit_pln']))
        amount = Decimal(str(product['amount']))

        subtotal_price_gbp += (cost_gbp * amount)
        subtotal_price_pln += (cost_pln * amount)

    # 2. Pobieramy ustawienia z Wagtaila
    from ..models import ShopSettings
    settings = ShopSettings.load()

    # Uwaga: w Twoim modelu pole nazywało się 'delivery_price',
    # a w kodzie użyłeś 'shipping_cost' – upewnij się, która nazwa jest właściwa!
    shipping = settings.delivery_price

    # 3. Wyliczenia w całości na obiektach Decimal (zamieniamy 0.01 i 1 na Decimal)
    tax_multiplier = (Decimal('0.01') * settings.tax) + Decimal('1')

    total_price_gbp = (subtotal_price_gbp * tax_multiplier) + shipping
    total_price_pln = (subtotal_price_pln * tax_multiplier) + shipping

    tax_gbp = subtotal_price_gbp * Decimal('0.01') * settings.tax
    tax_pln = subtotal_price_pln * Decimal('0.01') * settings.tax

    # 4. Zwracamy wyniki (Pythonowe 'round' działa poprawnie z obiektami Decimal)
    return {
        'subtotal_price_gbp': round(subtotal_price_gbp, 2),
        'subtotal_price_pln': round(subtotal_price_pln, 2),
        'tax_gbp': round(tax_gbp, 2),
        'tax_pln': round(tax_pln, 2),
        'total_price_gbp': round(total_price_gbp, 2),
        'total_price_pln': round(total_price_pln, 2),
    }