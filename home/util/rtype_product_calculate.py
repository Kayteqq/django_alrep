


def rtype_calculate_price(data: dir, ):
    from ..models import ShopSettings
    settings = ShopSettings.load()
    pln_to_gbp = float(settings.pln_to_gbp)



    cost_per_unit_pln: float = (
            (data['selectedDimensions']['price'] * data['widthL']) / 10000 +
            static_cost_pln
    )

    return {
        'cost_per_unit_pln': round(cost_per_unit_pln, 2),
        'cost_per_unit_gbp': round(cost_per_unit_pln / pln_to_gbp, 2),
    }