function checkout_page() {
    return {
        mobileStep: 0,
        formMainData: {},
        formSubData: {},
        isAddressSeparate: 'false',
        isTermsAccepted: false,
        totalPrice: 0,
        loading: false,
        init() {
            this.totalPrice = Number(document.getElementById('initial-total').textContent);
        },
        updateFormMainData() {
            this.formMainData = Object.fromEntries(new FormData(this.$refs.mainForm))
        },
        updateFormSubData() {
            this.formSubData = Object.fromEntries(new FormData(this.$refs.subForm))
        },
        get isCompleted() {
            if (!this.isTermsAccepted) return false
            if (this.formMainData["fist_name"] === "") return false
            if (this.formMainData["last_name"] === "") return false
            if (this.formMainData["city"] === "") return false
            if (this.formMainData["address_line_1"] === "") return false
            if (this.formMainData["postal_code"] === "") return false
            if (this.formMainData["phone_number"] === "") return false
            if (this.formMainData["email"] === "") return false

            if (this.isAddressSeparate !== 'false')
            {
                if (this.formSubData["fist_name"] === "") return false
                if (this.formSubData["last_name"] === "") return false
                if (this.formSubData["city"] === "") return false
                if (this.formSubData["address_line_1"] === "") return false
                if (this.formSubData["postal_code"] === "") return false
                if (this.formSubData["phone_number"] === "") return false
                if (this.formSubData["email"] === "") return false
            }

            return this.totalPrice > 0;
        },
        get dynamicData() {
            const data = {
                mainData: this.formMainData,
                subData: {},
            }
            if (this.isAddressSeparate !== 'false')
            {
                data.subData = this.formSubData;
            }
            else
            {
                data.subData = this.formMainData;
            }
            return data
        },
        submitData() {
            console.log(this.totalPrice)
            this.loading = true

            const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

            fetch(window.location.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify(this.dynamicData)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response failed.')
                }
                return response.json();
            })
            .then(data => {
                if (data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else if (data.status === 'error') {
                    console.error("Server Error", data.message);
                    this.loading = false;
                }
            })
            .catch(error => {
                console.log(error)
                this.loading = false
            })
        }
    }
}


function checkout_cart_data(){
    return {
        products: [],

        totalPrice: 0,

        init() {
            const initial_data = JSON.parse(document.getElementById('initial-data').textContent);
            console.log(initial_data);
            for(let i = 0; i < initial_data.length; i++) {
                const temp_product = {
                    "id": initial_data[i].id,
                    "name": "",
                    "price_unit": Number(initial_data[i].prices.cost_per_unit_gbp),
                    "quantity": Number(initial_data[i].amount)
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
        },
    }
}