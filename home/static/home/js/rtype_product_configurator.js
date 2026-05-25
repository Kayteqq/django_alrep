document.addEventListener('alpine:init', () => {
    Alpine.store('configurator', {
        opened: false,
    })
})

function rtype_product_configurator() {
    return {
        opened: false,
        input: {
            shape: '',
            name: '',
            widthL: 4000,
            amount: 1,
            selectedDimensions: '',
        },
        options: [],
        price: '',
        selectedColor: '',
        colorSearch: '',
        isColorActive: '',
        colors: RAL_COMPLETE_COLORSET,
        get pricePerL() {
            let temp = 0;
            for (let i = 0; i < this.options.length; i++) {
                if(String(this.options[i].size) === String(this.input.selectedDimensions))
                {
                    temp = this.options[i].price;
                    break;
                }
            }
            return temp;
        },
        get filteredColors() {
            if (this.colorSearch === '') return [];

            return this.colors
            .filter(c =>
                String(c.id).toLowerCase().includes(String(this.colorSearch).toLowerCase()) ||
                String(c.name).toLowerCase().includes(String(this.colorSearch).toLowerCase()) ||
                String(c.hex).toLowerCase().includes(String(this.colorSearch).toLowerCase())
            )
            .slice(0, 3); // Limit do 3 elementów
        },


        selectColor(color) {
            this.selectedColor = color;
            this.colorSearch = '';
        },

        update() {
            window.dispatchEvent(new CustomEvent('configurator-updated', {
                detail: {
                    opened: this.opened
                }
            }))

            this.sendDataDebounced(this.input, 'update-price').then().catch(err => console.error(err));

        },

        loadDimensions() {
            this.input.selectedDimensions = '';
            const scriptTag = document.getElementById('dims-' + this.input.shape);
            this.options = JSON.parse(scriptTag.textContent)
            this.input.selectedDimensions = JSON.parse(scriptTag.textContent)[0];

        },
        async sendDataDebounced(data, action) {
            clearTimeout(this.sendTimeout);
            this.sendTimeout = setTimeout(() => {
                this.sendData(data, action);
            }, 300)
        },

        async sendData(data, action){
            const csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
            let response = await fetch(window.location.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    action: action,
                    product: "profile",
                    shape: String(data.shape),
                    widthL: Number(data.widthL),
                    amount: Number(data.amount),
                    selectedDimensions: {
                        size: String(data.selectedDimensions),
                        price: Number(this.pricePerL),
                    },
                    selectedColor: data.selectedColor,
                })
            })

            let response_data = await response.json();
            if (response_data.status === 'success') {
            // Tutaj dynamicznie aktualizujesz frontend danymi z serwera
                if(action === 'update-price')
                {
                    this.price = response_data.results;
                }
            }

        },
    }
}