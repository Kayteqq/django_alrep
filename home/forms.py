from django import forms


class ContactForm(forms.Form):
    name = forms.CharField(max_length=100)
    email = forms.EmailField()
    message = forms.CharField(widget=forms.Textarea)

    def __init__(self, *args, **kwargs):
        labels = kwargs.pop('custom_labels', {})
        super().__init__(*args, **kwargs)

        if labels:
            self.fields['name'].label = labels.get('name')
            self.fields['email'].label = labels.get('email')
            self.fields['message'].label = labels.get('message')

        # --- TUTAJ DODAJEMY KLASY CSS ---
        # Przechodzimy pętlą po wszystkich polach formularza
        for field_name, field in self.fields.items():
            # Sprawdzamy obecne klasy (żeby niczego nie nadpisać) i dodajemy własną
            existing_classes = field.widget.attrs.get('class', '')

            if field_name == 'message':
                # Jeśli chcesz inną klasę dla obszaru tekstowego (textarea)
                field.widget.attrs['class'] = f"{existing_classes} section-contact__textarea".strip()
            else:
                # Klasa dla standardowych pól (input)
                field.widget.attrs['class'] = f"{existing_classes} section-contact__input".strip()

class OrderForm(forms.Form):
    company_name = forms.CharField(max_length=255, required=False)
    first_name = forms.CharField(max_length=255, required=True)
    last_name = forms.CharField(max_length=255, required=True)
    city = forms.CharField(max_length=255, required=True)
    address_line_1 = forms.CharField(max_length=255, required=True)
    address_line_2 = forms.CharField(max_length=255, required=False)
    postal_code = forms.CharField(max_length=255, required=True)
    phone_number = forms.CharField(max_length=255, required=True)
    email = forms.EmailField()

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        self.fields['company_name'].label = 'Company Name'
        self.fields['first_name'].label = 'First Name*'
        self.fields['last_name'].label = 'Last Name*'
        self.fields['city'].label = 'City*'
        self.fields['address_line_1'].label = 'Address Line 1*'
        self.fields['address_line_2'].label = 'Address Line 2'
        self.fields['postal_code'].label = 'Postcode*'
        self.fields['phone_number'].label = 'Phone Number*'
        self.fields['email'].label = 'E-Mail*'


        for field_name, field in self.fields.items():
            existing_classes = field.widget.attrs.get('class', '')

            field.widget.attrs['class'] = f"{existing_classes} section-information__input".strip()