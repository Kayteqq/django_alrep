


def rtype_calculate_price(data: dir, prices_data: dir):
    from ..models import ShopSettings
    settings = ShopSettings.load()
    pln_to_gbp = float(settings.pln_to_gbp)
    cost_per_unit_pln: float = 0.0

    print(data['widthL'], prices_data)

    if 0 < data['widthL'] <= 1000:
        cost_per_unit_pln = data['widthL'] * prices_data['price_1000'] * (0.01 * prices_data['margin_1000'] + 1) / 10000

    elif 1000 < data['widthL'] <= 2000:
        cost_per_unit_pln = data['widthL'] * prices_data['price_2000'] * (0.01 * prices_data['margin_2000'] + 1) / 10000

    elif 2000 < data['widthL'] <= 3000:
        cost_per_unit_pln = data['widthL'] * prices_data['price_3000'] * (0.01 * prices_data['margin_3000'] + 1) / 10000

    elif 3000 < data['widthL'] <= 4000:
        cost_per_unit_pln = (data['widthL'] *
                             prices_data['price_4000'] *
                             (0.01 * prices_data['margin_4000'] + 1)
                             / 10000)


    return {
        'cost_per_unit_pln': round(cost_per_unit_pln, 2),
        'cost_per_unit_gbp': round(cost_per_unit_pln / pln_to_gbp, 2),
    }