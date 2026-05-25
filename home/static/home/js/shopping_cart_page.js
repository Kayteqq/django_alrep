
function shopping_cart_data() {
    return {
        products: [],

        subtotalPrice: 0,
        totalPrice: 0,
        taxPrice: 0,

        init() {
            const initial_data = JSON.parse(document.getElementById('initial-data').textContent);
            for(let i = 0; i < initial_data.length; i++) {
                const temp_product = {
                    "id": initial_data[i].id,
                    "name": "",
                    "price_unit": Number(initial_data[i].prices.cost_per_unit_gbp),
                    "quantity": Number(initial_data[i].amount),
                }
                if (initial_data[i].product === 'C')
                {
                    if (initial_data[i].shape === 'L')
                    {
                        temp_product.name = 'C-Shaped Window Cills'
                    }
                    else if (initial_data[i].shape === 'Z')
                    {
                        temp_product.name = 'Z-Shaped Window Cills'
                    }
                }
                else if (initial_data[i].product === 'P')
                {
                    if (initial_data[i].shape === 'L')
                    {
                        temp_product.name = 'L-Shaped Pressings'
                    }
                    else if (initial_data[i].shape === 'Z')
                    {
                        temp_product.name = 'Z-Shaped Pressings'
                    }
                    else if (initial_data[i].shape === 'C')
                    {
                        temp_product.name = 'C-Shaped Pressings'
                    }
                }
                else if (initial_data[i].product === 'profile')
                {
                    if (initial_data[i].shape === 'FP')
                        temp_product.name = 'Flat Plate Profile'
                    else if (initial_data[i].shape === 'EA')
                        temp_product.name = 'Equal Angle Profile'
                    else if (initial_data[i].shape === 'UA')
                        temp_product.name = 'Unequal Angle Profile'
                    else if (initial_data[i].shape === 'US')
                        temp_product.name = 'U-Shaped Profile'
                    else if (initial_data[i].shape === 'TS')
                        temp_product.name = 'T-Shaped Profile'
                    else if (initial_data[i].shape === 'SQ')
                        temp_product.name = 'Square Tube Profile'
                    else if (initial_data[i].shape === 'RT')
                        temp_product.name = 'Rectangular Tube Profile'
                    else if (initial_data[i].shape === 'CT')
                        temp_product.name = 'Circular Tube Profile'
                }
                if(!this.products.some(obj => obj.id === temp_product.id))
                this.products.push(temp_product);
            }

            this.totalPrice = Number(document.getElementById('initial-price').textContent);
            this.subtotalPrice = Number(document.getElementById('initial-subtotal').textContent);
            this.taxPrice = Number(document.getElementById('initial-tax').textContent);

        },
        addUnit(index) {
            this.products[index].quantity++;
            this.updateAmount(index);
        },
        subUnit(index) {
            if(this.products[index].quantity > 1)
            {
                this.products[index].quantity--;
                this.updateAmount(index);
            }

        },
        remove(index) {
            this.updateRemoveProduct(index);
            this.products.splice(index, 1);
        },
        updateAmount(index) {
            const data = {
                'action': 'amount-change',
                'id': this.products[index].id,
                'amount': Number(this.products[index].quantity),
            }
            this.sendDataDebounced(data).then().catch(err => console.error(err));
        },
        updateRemoveProduct(index) {
            const data = {
                'action': 'remove-product',
                'id': this.products[index].id,
            }
            this.sendDataDebounced(data).then().catch(err => console.error(err));
        },
        async sendDataDebounced(data) {
            clearTimeout(this.sendTimeout);
            this.sendTimeout = setTimeout(() => {
                this.sendData(data);
            }, 300)
        },
        async sendData(data) {
            const csrftoken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
            let response = await fetch(window.location.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(data)
            })

            let response_data = await response.json();
            if (response_data.status === 'success') {
                this.totalPrice = response_data.data.total_price;
                this.subtotalPrice = response_data.data.subtotal_price;
                this.taxPrice = response_data.data.tax_price;
            }
        }

    }
}