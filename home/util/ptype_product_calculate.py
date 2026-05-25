# PLN_TO_GBP = 4.8
# COST_PER_WEIGHT_PLN = 20
# COST_PER_BEND_PLN = 20
# COST_PER_PAINT_PLN = 100
# STATIC_COST_PLN = 30

def ptype_calculate_price(data: dir, pln_to_gbp: float, cost_per_weight_pln: float, cost_per_bend_pln: float, cost_per_paint: float, static_cost_pln: float):
    num_bends: int = 0
    alum_area: float = 0.0
    num_paint: float = 0.0
    weight: float = 0.0

    if data['shape'] == 'L':
        num_bends = 1
        alum_area = ((data['dripEdgeHeightH'] + data['depthE']) * data['widthL']) / 1000000
    elif data['shape'] == 'C' or data['shape'] == 'Z':
        num_bends = 2
        alum_area = ((data['dripEdgeHeightH'] + data['apronHeightA'] + data['depthE']) * data['widthL']) / 1000000

    # potencjalnie do zmiany!
    num_paint = 1 if data['amount'] * alum_area < 1 else alum_area

    weight = data['thicknessG'] * alum_area * 2.7

    # mult: float = 0.0
    # if data['amount'] <= 5:
    #     mult = 1.5
    # elif data['amount'] > 5:
    #     mult = 1.25
    # else:
    #     mult = 1.0

    cost_per_unit_pln: float = (
            (weight * cost_per_weight_pln) +
            (num_bends * cost_per_bend_pln) +
            (num_paint * cost_per_paint) +
            static_cost_pln
    )

    return {
        'cost_per_unit_pln': round(cost_per_unit_pln, 2),
        'cost_per_unit_gbp': round(cost_per_unit_pln / pln_to_gbp, 2),
    }