from wagtail.models import Locale, Site
from django.utils.translation import get_language

from .models import NavbarLinksPage, ShoppingCartProductPage


def home_link_processor(request):

    locale = Locale.get_active()


    site = Site.objects.filter(is_default_site=True).select_related('root_page').first()
    if not site or not site.root_page:
        return {'home_page': None}

    home = site.root_page

    if locale and home.locale_id != locale.id:
        home = home.get_translation_or_none(locale) or home

    return {'home_page': home}


def navbar_links_processor(request):
    lang_code = get_language()
    locale = Locale.objects.filter(language_code=lang_code).first()

    if locale:
        translated_navbar_page = NavbarLinksPage.objects.filter(locale=locale).first()
        if not translated_navbar_page or not translated_navbar_page.navbar_links:
            navbar_page = NavbarLinksPage.objects.first()
        else:
            navbar_page = translated_navbar_page
        if not translated_navbar_page or not translated_navbar_page.terms_conditions:
            terms_conditions = NavbarLinksPage.objects.first()
        else:
            terms_conditions = translated_navbar_page
        if not translated_navbar_page or not translated_navbar_page.shopping_returns:
            shopping_returns = NavbarLinksPage.objects.first()
        else:
            shopping_returns = translated_navbar_page
        if not translated_navbar_page or not translated_navbar_page.privacy_policy:
            privacy_policy = NavbarLinksPage.objects.first()
        else:
            privacy_policy = translated_navbar_page
    else:
        navbar_page = NavbarLinksPage.objects.first()
        terms_conditions = NavbarLinksPage.objects.first()
        shopping_returns = NavbarLinksPage.objects.first()
        privacy_policy = NavbarLinksPage.objects.first()

    return {
        'navbar_links': navbar_page.navbar_links if navbar_page else [],
        'terms_conditions': terms_conditions.terms_conditions if terms_conditions else [],
        'shopping_returns': shopping_returns.shopping_returns if shopping_returns else [],
        'privacy_policy': privacy_policy.privacy_policy if privacy_policy else [],
    }

def cart_link_processor(request):
    locale = Locale.get_active()

    cart = ShoppingCartProductPage.objects.live().public().filter(locale=locale).first()


    if not cart:
        cart = ShoppingCartProductPage.objects.live().public().first()

    return {'cart_page': cart}
