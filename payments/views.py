import stripe
from django.conf import settings
from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt

from .models import Order
from .util.add_order_to_db import add_order_to_db
from .util.send_order_confirmation_emails import send_order_confirmation_emails

stripe.api_key = settings.STRIPE_SECRET_KEY


def create_checkout_session(request):
    # 1. Pobieramy dane zapisane w sesji
    user_data = request.session.get('user_data', {})
    products = user_data.get('products', [])
    prices = user_data.get('prices', {})
    checkout_data = user_data.get('order_data', {})

    # Sprawdzamy, czy koszyk nie jest pusty
    if not products or not prices or not checkout_data:
        return redirect('shopping_cart_url_name')

    total_price = prices.get('total_price')
    if not total_price:
        return redirect('shopping_cart_url_name')

    # 2. Tworzymy zamówienie w bazie z wykorzystaniem funkcji pomocniczej
    order = add_order_to_db(checkout_data, products, prices)

    # 3. Kwota dla Stripe (w groszach/pensach)
    stripe_amount = int(float(total_price) * 100)

    request.session['last_order_id'] = str(order.id)
    request.session.modified = True

    # 4. Tworzymy sesję Stripe
    try:
        session = stripe.checkout.Session.create(
            mode='payment',
            customer_email=order.customer_email,
            line_items=[{
                'price_data': {
                    'currency': 'gbp',
                    'product_data': {'name': 'Alrep Product Order'},
                    'unit_amount': stripe_amount,
                },
                'quantity': 1,
            }],
            metadata={'order_id': str(order.id)},
            success_url=request.build_absolute_uri('/payments/success/'),
            cancel_url=request.build_absolute_uri('/payments/cancel/'),
        )
        return redirect(session.url, code=303)

    except Exception as e:
        print(f"Stripe session error: {e}")
        order.status = 'failed'
        order.save()
        return redirect('shopping_cart_url_name')


@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError:
        return HttpResponse('Invalid payload', status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse('Invalid signature', status=400)

    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        order_id = session.get('metadata', {}).get('order_id')
        payment_intent = session.get('payment_intent')

        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                order.status = 'paid'
                if payment_intent:
                    order.stripe_payment_intent = payment_intent
                order.save()
                print(f'Payment {order_id} succeeded')
            except Order.DoesNotExist:
                print(f'Order {order_id} not found!')

    elif event['type'] == 'checkout.session.async_payment_failed':
        session = event['data']['object']
        order_id = session.get('metadata', {}).get('order_id')

        if order_id:
            try:
                order = Order.objects.get(id=order_id)
                order.status = 'failed'
                order.save()
                print(f'Payment {order_id} failed')
            except Order.DoesNotExist:
                print(f'Order {order_id} not found!')

    return HttpResponse('Done', status=200)


def success_view(request):
    ##### VERY TEMP #####

    order_id = request.session.get('last_order_id')

    if order_id:
        try:
            order = Order.objects.get(id=order_id)
            # Wywołanie testowe
            send_order_confirmation_emails(order)
            print(f"Testowo wysłano maila dla zamówienia {order_id}")
        except Order.DoesNotExist:
            print("Nie znaleziono zamówienia do testu maila.")

    return render(request, 'payments/success.html')


def cancel_view(request):
    return render(request, 'payments/cancel.html')