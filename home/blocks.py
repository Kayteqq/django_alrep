from wagtail import blocks

class InternalLinkBlock(blocks.StructBlock):
    text = blocks.CharBlock(label="Tekst Linku", blank=True, null=True, max_length=255, required=True)
    page = blocks.PageChooserBlock(label="Strona do przekierowania", blank=True, null=True, required=True)

    class Meta:
        icon = 'placeholder'
        label = 'Link - Przekierowanie na Podstronę'

class NavbarBlockContainer(blocks.StreamBlock):
    page_link = InternalLinkBlock()

    class Meta:
        label = 'Navbar - Element'
        icon = 'list-ul'

class PriceDimensionBlock(blocks.StructBlock):
    size = blocks.CharBlock(
        required=True,
        label="Rozmiar",
        help_text="np. 100x200 lub Mały"
    )
    price_per_meter_to_1000 = blocks.DecimalBlock(
        required=True,
        label="Cena za metr do 1000mm",
        min_value=0,
        max_digits=10,
        decimal_places=2
    )
    price_per_meter_to_2000 = blocks.DecimalBlock(
        required=True,
        label="Cena za metr do 2000mm",
        min_value=0,
        max_digits=10,
        decimal_places=2
    )
    price_per_meter_to_3000 = blocks.DecimalBlock(
        required=True,
        label="Cena za metr do 3000mm",
        min_value=0,
        max_digits=10,
        decimal_places=2
    )
    price_per_meter_to_4000 = blocks.DecimalBlock(
        required=True,
        label="Cena za metr do 4000mm",
        min_value=0,
        max_digits=10,
        decimal_places=2
    )
    margin_1000 = blocks.DecimalBlock(
        required=True,
        label="Marża do 1000mm",
        min_value=0,
        max_digits=10,
        decimal_places=2
    )
    margin_2000 = blocks.DecimalBlock(
        required=True,
        label="Marża do 1000mm",
        min_value=0,
        max_digits=10,
        decimal_places=2
    )
    margin_3000 = blocks.DecimalBlock(
        required=True,
        label="Marża do 1000mm",
        min_value=0,
        max_digits=10,
        decimal_places=2
    )
    margin_4000 = blocks.DecimalBlock(
        required=True,
        label="Marża do 1000mm",
        min_value=0,
        max_digits=10,
        decimal_places=2
    )

    class Meta:
        icon = 'list-ul'
        label = "Wymiar i Cena"