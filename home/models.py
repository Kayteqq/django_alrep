import json
import uuid

from django.core.exceptions import PermissionDenied
from django.core.mail import EmailMessage
from django.core.validators import MinValueValidator
from django.db import models
from django.http import JsonResponse, HttpResponseRedirect
from django.shortcuts import redirect
from wagtail import blocks
from wagtail.admin.messages import render

from wagtail.admin.panels import PageChooserPanel, FieldPanel
from wagtail.contrib.settings.models import BaseGenericSetting, BaseSiteSetting
from wagtail.contrib.settings.registry import register_setting
from wagtail.fields import StreamField, RichTextField
from wagtail.models import Page

from .blocks import NavbarBlockContainer, PriceDimensionBlock
from .forms import ContactForm, OrderForm
from .util.ptype_product_calculate import ptype_calculate_price
from .util.rtype_product_calculate import rtype_calculate_price
from .util.price_total_calculate import calculate_total_price

@register_setting
class SocialMediaSettings(BaseSiteSetting):
    url_youtube     = models.URLField("URL Facebook",   blank=True, null=True)
    url_instagram   = models.URLField("URL Instagram",  blank=True, null=True)

    content_panels = Page.content_panels + [
        FieldPanel('url_youtube'),
        FieldPanel('url_instagram'),
    ]

    class Meta:
        verbose_name = 'Social Media - Linki'
        verbose_name_plural = 'Social Media - Linki'

@register_setting
class ShopSettings(BaseGenericSetting):
    pln_to_gbp = models.DecimalField(
        decimal_places=2,
        max_digits=5,
        default=5.00,
        help_text="current PLN to GBP",
    )
    tax = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        default=23.00,
        help_text="current tax in percentage (%)"
    )
    delivery_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=15.00,
        help_text="current delivery price (£)"
    )
    alrep_mail = models.EmailField(
        default="alrep@test.com",
    )
    argo_mail = models.EmailField(
        default="argo@test.com",
    )

    class Meta:
        verbose_name = "Shop Settings"


class NavbarLinksPage(Page):
    parent_page_types = ['RootRedirectPage']
    subpage_types = []
    max_count = 1
    template = 'home/navbar_preview_page.html'

    navbar_links = StreamField(
        NavbarBlockContainer,
        blank=True,
        null=True,
        verbose_name='Navbar Links',
    )

    content_panels = Page.content_panels + [
        FieldPanel('navbar_links'),
    ]

    show_in_menus = False
    search_fields = []

    def get_url_parts(self, request=None):
        return None

    def get_url(self, request=None, current_site=None):
        return None

    def serve(self, request, *args, **kwargs):
        raise PermissionDenied("This page cannot be accessed directly.")

    class Meta:
        verbose_name = 'Navbar Links'
        verbose_name_plural = 'Navbar Links'

class RootRedirectPage(Page):
    parent_page_types = ['wagtailcore.Page']
    max_count = 1
    redirect_to = models.ForeignKey(
        Page,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    content_panels = Page.content_panels + [
        PageChooserPanel('redirect_to'),
    ]

    def serve(self, request, *args, **kwargs):
        if self.redirect_to:
            return redirect(self.redirect_to.url)
        else:
            return redirect('/')

class HomePage(Page):
    max_count = 1
    template = 'home/home_page.html'
    parent_page_types = ['RootRedirectPage']
    subpage_types = []


    redirect_product_1 = models.ForeignKey(
        Page,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    redirect_product_2 = models.ForeignKey(
        Page,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    redirect_product_3 = models.ForeignKey(
        Page,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='+'
    )

    content_panels = Page.content_panels + [
        FieldPanel('redirect_product_1'),
        FieldPanel('redirect_product_2'),
        FieldPanel('redirect_product_3'),
    ]

class ProductType(models.TextChoices):
    PRESSINGS = 'P', 'Pressings'
    WINDOW_CILLS = 'C', 'Window Cills'

class PressingsTypeProductPage(Page):
    template = 'home/ptype_product_page.html'
    parent_page_types = ['RootRedirectPage']
    subpage_types = []

    configurator_type = models.CharField(
        max_length=1,
        choices=ProductType.choices,
        default=ProductType.PRESSINGS,
        verbose_name='Type of configurator'
    )

    cost_per_weight_pln = models.DecimalField(
        verbose_name="Weight Cost, PLN",
        validators=[MinValueValidator(0)],
        max_digits=10,
        decimal_places=2
    )

    cost_per_bend_pln = models.DecimalField(
        verbose_name="Bend Cost, PLN",
        validators=[MinValueValidator(0)],
        max_digits=10,
        decimal_places=2
    )

    cost_per_paint = models.DecimalField(
        verbose_name="Paint Cost, PLN",
        validators=[MinValueValidator(0)],
        max_digits=10,
        decimal_places=2
    )

    static_cost_pln = models.DecimalField(
        verbose_name="Static Cost, PLN",
        validators=[MinValueValidator(0)],
        max_digits=10,
        decimal_places=2
    )

    content_panels = Page.content_panels + [
        FieldPanel('configurator_type'),
        FieldPanel('cost_per_weight_pln'),
        FieldPanel('cost_per_bend_pln'),
        FieldPanel('cost_per_paint'),
        FieldPanel('static_cost_pln'),
    ]


    def serve(self, request, *args, **kwargs):
        if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            try:
                data = json.loads(request.body)

                if data['action'] == 'update-price':
                    prices = ptype_calculate_price(data,
                                                   cost_per_weight_pln=float(self.cost_per_weight_pln),
                                                   cost_per_bend_pln=float(self.cost_per_bend_pln),
                                                   cost_per_paint=float(self.cost_per_paint),
                                                   static_cost_pln=float(self.static_cost_pln)
                                                   )

                    return JsonResponse({
                        'status': 'success',
                        'results': prices['cost_per_unit_gbp']
                    }, status=200)


                elif data['action'] == 'add-product':
                    prices = ptype_calculate_price(data,
                                                   cost_per_weight_pln=float(self.cost_per_weight_pln),
                                                   cost_per_bend_pln=float(self.cost_per_bend_pln),
                                                   cost_per_paint=float(self.cost_per_paint),
                                                   static_cost_pln=float(self.static_cost_pln)
                                                   )
                    unique_id = str(uuid.uuid4())

                    data.pop('action')
                    data['prices'] = prices
                    data['id'] = unique_id
                    user_data = request.session.setdefault('user_data', {})

                    # Upewnij się, że mamy listę produktów
                    if not isinstance(user_data.get('products'), list):
                        user_data['products'] = []

                    # Dodaj produkt
                    user_data['products'].append(data)

                    # Powiadom Django o zmianie
                    request.session.modified = True
                    return JsonResponse({'status': 'success'}, status=200)
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

        return super().serve(request, *args, **kwargs)


class ProfilesTypeProductListingPage(Page):
    max_count = 1
    template = 'home/rtype_product_page.html'
    subpage_types = ['ProfileProductPage']

    static_cost_pln = models.DecimalField(
        verbose_name="Static Cost, PLN",
        validators=[MinValueValidator(0)],
        max_digits=10,
        decimal_places=2
    )

    content_panels = Page.content_panels + [
        FieldPanel('static_cost_pln'),
    ]

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request)
        context['profiles'] = self.get_children().live().specific()
        return context


    def serve(self, request, *args, **kwargs):
        if request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            try:
                data = json.loads(request.body)

                if data['action'] == 'update-price':
                    target_profile_type = data['shape']
                    target_profile_size = data['selectedDimensions']['size']

                    # Filtrujemy bezpośrednio model dziecka, wskazując, że rodzicem (child_of) jest obecna strona (self)
                    profile_page = ProfileProductPage.objects.live().child_of(self).filter(
                        profile_type=target_profile_type
                    ).first()

                    if not profile_page:
                        return JsonResponse({'status': 'error', 'message': 'Profile type not found'}, status=404)

                    prices_data = {}
                    for block in profile_page.price_list:
                        if block.block_type == 'dimension':
                            if block.value.get('size') == target_profile_size:
                                prices_data = {
                                    'price_1000': float(block.value.get('price_per_meter_to_1000') or 0),
                                    'price_2000': float(block.value.get('price_per_meter_to_2000') or 0),
                                    'price_3000': float(block.value.get('price_per_meter_to_3000') or 0),
                                    'price_4000': float(block.value.get('price_per_meter_to_4000') or 0),
                                    'margin_1000': float(block.value.get('margin_1000') or 0),
                                    'margin_2000': float(block.value.get('margin_2000') or 0),
                                    'margin_3000': float(block.value.get('margin_3000') or 0),
                                    'margin_4000': float(block.value.get('margin_4000') or 0),
                                }
                    prices = rtype_calculate_price(data, prices_data)

                    return JsonResponse({
                        'status': 'success',
                        'results': prices['cost_per_unit_gbp']
                    }, status=200)


                if data['action'] == 'add-product':
                    target_profile_type = data['shape']
                    target_profile_size = data['selectedDimensions']['size']

                    # Filtrujemy bezpośrednio model dziecka, wskazując, że rodzicem (child_of) jest obecna strona (self)
                    profile_page = ProfileProductPage.objects.live().child_of(self).filter(
                        profile_type=target_profile_type
                    ).first()

                    if not profile_page:
                        return JsonResponse({'status': 'error', 'message': 'Profile type not found'}, status=404)

                    prices_data = {}
                    for block in profile_page.price_list:
                        if block.block_type == 'dimension':
                            if block.value.get('size') == target_profile_size:
                                prices_data = {
                                    'price_1000': float(block.value.get('price_per_meter_to_1000') or 0),
                                    'price_2000': float(block.value.get('price_per_meter_to_2000') or 0),
                                    'price_3000': float(block.value.get('price_per_meter_to_3000') or 0),
                                    'price_4000': float(block.value.get('price_per_meter_to_4000') or 0),
                                    'margin_1000': float(block.value.get('margin_1000') or 0),
                                    'margin_2000': float(block.value.get('margin_2000') or 0),
                                    'margin_3000': float(block.value.get('margin_3000') or 0),
                                    'margin_4000': float(block.value.get('margin_4000') or 0),
                                }
                    prices = rtype_calculate_price(data, prices_data)
                    unique_id = str(uuid.uuid4())

                    data.pop('action')
                    data['prices'] = prices
                    data['id'] = unique_id
                    user_data = request.session.setdefault('user_data', {})

                    if not isinstance(user_data.get('products'), list):
                        user_data['products'] = []

                    user_data['products'].append(data)

                    request.session.modified = True
                    return JsonResponse({'status': 'success'}, status=200)
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

        return super().serve(request, *args, **kwargs)


class ProfileType(models.TextChoices):
    FLAT_PLATE = 'FP', 'Flat Plate'
    EQUAL_ANGLE = 'EA', 'Equal Angle'
    UNEQUAL_ANGLE = 'UA', 'Unequal Angle'
    U_SHAPE = 'US', 'U-Shape'
    T_SHAPE = 'TS', 'T-Shape'
    SQUARE_TUBE = 'SQ', 'Square Tube'
    RECTANGULAR_TUBE = 'RT', 'Rectangular Tube'
    CIRCULAR_TUBE = 'CT', 'Circular Tube'
    ADD = 'AD', 'Ad'


class ProfileProductPage(Page):
    show_in_menus = False
    search_fields = []

    profile_type = models.CharField(
        max_length=2,
        choices=ProfileType.choices,
        default=ProfileType.FLAT_PLATE,
        verbose_name='Type of image visualisation'
    )

    price_list = StreamField([
        ('dimension', PriceDimensionBlock()),
    ], use_json_field=True, blank=True)

    content_panels = Page.content_panels + [
        FieldPanel('profile_type'),
        FieldPanel('price_list'),
    ]

    def get_url_parts(self, request=None):
        return None

    def get_url(self, request=None, current_site=None):
        return None

    def serve(self, request, *args, **kwargs):
        raise PermissionDenied("This page cannot be accessed directly.")


class ShoppingCartProductPage(Page):
    max_count = 1
    template = 'home/shopping_cart_page.html'
    parent_page_types = ['RootRedirectPage']
    subpage_types = []

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        current_data = request.session.get('user_data', {})
        context['products'] = current_data.get('products', [])
        prices = calculate_total_price(current_data.get('products', []))
        context['total_price'] = float(prices['total_price_gbp'])
        context['subtotal_price'] = float(prices['subtotal_price_gbp'])
        context['tax_price'] = float(prices['tax_gbp'])

        return context

    def serve(self, request, *args, **kwargs):
        if request.method == 'GET':
            current_data = request.session.get('user_data', {})
            prices = calculate_total_price(current_data.get('products', []))
            current_data['total_price'] = float(prices['total_price_gbp'])
            current_data['subtotal_price'] = float(prices['subtotal_price_gbp'])
            current_data['tax_price'] = float(prices['tax_gbp'])
            request.session['user_data'] = current_data
            request.session.modified = True

        elif request.method == 'POST' and request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            try:
                data = json.loads(request.body)

                if data['action'] == 'amount-change':
                    current_data = request.session.get('user_data', {})
                    for el in current_data.get('products', []):
                        if el['id'] == data['id']:
                            el['amount'] = data['amount']

                    prices = calculate_total_price(current_data.get('products', []))
                    current_data['total_price'] = float(prices['total_price_gbp'])
                    current_data['subtotal_price'] = float(prices['subtotal_price_gbp'])
                    current_data['tax_price'] = float(prices['tax_gbp'])

                    request.session['user_data'] = current_data
                    request.session.modified = True
                    return JsonResponse(
                        {
                            'status': 'success',
                            'data': {
                                'total_price': prices['total_price_gbp'],
                                'subtotal_price': prices['subtotal_price_gbp'],
                                'tax_price': prices['tax_gbp']
                            }
                        }, status=200)

                elif data['action'] == 'remove-product':
                    current_data = request.session.get('user_data', {})
                    products = current_data.get('products', [])
                    current_data['products'] = [p for p in products if p['id'] != data['id']]

                    prices = calculate_total_price(current_data.get('products', []))
                    current_data['total_price'] = float(prices['total_price_gbp'])
                    current_data['subtotal_price'] = float(prices['subtotal_price_gbp'])
                    current_data['tax_price'] = float(prices['tax_gbp'])

                    request.session['user_data'] = current_data
                    request.session.modified = True
                    return JsonResponse(
                        {
                            'status': 'success',
                            'data': {
                                'total_price': prices['total_price_gbp'],
                                'subtotal_price': prices['subtotal_price_gbp'],
                                'tax_price': prices['tax_gbp']
                            }
                        }, status=200)



            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=400)

        return super().serve(request, *args, **kwargs)


class CheckoutPage(Page):
    max_count = 1
    template = 'home/checkout_page.html'
    parent_page_types = ['RootRedirectPage']
    subpage_types = []

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request, *args, **kwargs)
        current_data = request.session.get('user_data', {})
        context['products'] = current_data.get('products', [])
        prices = calculate_total_price(current_data.get('products', []))
        context['total_price'] = float(prices['total_price_gbp'])
        context['subtotal_price'] = float(prices['subtotal_price_gbp'])
        context['tax_price'] = float(prices['tax_gbp'])
        context['form_main'] = OrderForm()
        context['form_sub'] = OrderForm()

        return context

    def serve(self, request, *args, **kwargs):
        if request.method == 'POST':
            try:
                order_data = json.loads(request.body)
                current_data = request.session.get('user_data', {})
                prices = calculate_total_price(current_data.get('products', []))
                prices_data = {
                    'subtotal_price': float(prices['subtotal_price_gbp']),
                    'tax': float(prices['tax_gbp']),
                    'total_price': float(prices['total_price_gbp']),
                }
                current_data['prices'] = prices_data
                current_data['order_data'] = order_data

                request.session['user_data'] = current_data
                request.session.modified = True

                return JsonResponse({'redirect_url': '/payments/create-checkout-session/'})
            except json.JSONDecodeError:
                return JsonResponse({'status': 'error', 'message': 'Niepoprawny format JSON'}, status=400)
            except Exception as e:
                return JsonResponse({'status': 'error', 'message': str(e)}, status=500)

        return super().serve(request, *args, **kwargs)

class ContactPage(Page):
    max_count = 1
    template = 'home/contact_page.html'
    parent_page_types = ['RootRedirectPage']
    subpage_types = []

    recipient_mail = models.EmailField(default='alrep@text.com')

    content_panels = Page.content_panels + [
        FieldPanel('recipient_mail'),
    ]

    def get_context(self, request, *args, **kwargs):
        context = super().get_context(request)
        context.update({
            'form': ContactForm(),
            'submitted': False,
        })
        return context

    def serve(self, request, *args, **kwargs):
        if request.method == 'POST':
            form = ContactForm(request.POST)
            if form.is_valid():
                data = form.cleaned_data
                full_message = f"""
                    New message from: {data['name']}
                    Email: {data['email']}

                    Content:
                    {data['message']}
                """

                email = EmailMessage(
                    subject=f'New message from: {data["name"]}',
                    body=full_message,
                    from_email=None,
                    to=['twoj-testowy-mail@example.com'],
                )
                email.send(fail_silently=False)

                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({'status': 'success'}, status=200)

                return render(request, self.template, {
                    'page': self,
                    'form': ContactForm(),
                    'submitted': True,
                })
            else:
                if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
                    return JsonResponse({
                        'status': 'error',
                        'errors': form.errors.get_json_data(),
                    }, status=400)

        return super().serve(request, *args, **kwargs)

    class DocumentPage(Page):
        template = 'home/document_page.html'
        parent_page_types = ['RootRedirectPage']
        subpage_types = []

        document_title = models.CharField("Title", max_length=255, blank=True)
        document_body = RichTextField(blank=True, features=['h2'])

        content_panels = Page.content_panels + [
            FieldPanel('document_title'),
            FieldPanel('document_body'),
        ]

        class Meta:
            verbose_name = "Contract or Certification Page"
            verbose_name_plural = "Contract or Certification Pages"