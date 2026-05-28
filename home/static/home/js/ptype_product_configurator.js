
const SHAPE_START_X = 30;
const SHAPE_START_Y = 30;
const LONG_ARC = 2;
const SHORT_ARC = 1;
const BIG_STROKE_WIDTH = 0.5;
const SMALL_STROKE_WIDTH = 0.25;
const MEASURING_LINE_LENGTH = 20;
const MEASUREMENT_MARGIN = 18.5;

const MIN_DEPTH = 12;
const MAX_DEPTH = 450;
const MAX_DEPTH_TOTAL = 900;
const MAX_PROPORTION = 0.5;
const MIN_WIDTH = 0;
const MAX_WIDTH = 3000;
const MAX_ANGLE = 180;
const MIN_ANGLE = 90;

document.addEventListener('alpine:init', () => {
    Alpine.store('configurator', {
        opened: false,
    })
})


function ptype_product_configurator() {
    const defaultsL = {
        shape: 'L',
        depthE: '200',
        dripEdgeHeightH: '50',
        apronHeightA: '0',
        widthL: '1000',
        thicknessG: '2.0',
        amount: '1',
        dripEdgeAngleAlpha: '90',
        apronAngleBeta: '90',
    }

    const defaultsZ = {
        shape: 'Z',
        depthE: '200',
        dripEdgeHeightH: '50',
        apronHeightA: '50',
        widthL: '1000',
        thicknessG: '2.0',
        amount: '1',
        dripEdgeAngleAlpha: '90',
        apronAngleBeta: '90',
    }

    const defaultsC = {
        shape: 'C',
        depthE: '200',
        dripEdgeHeightH: '40',
        apronHeightA: '50',
        widthL: '1000',
        thicknessG: '2.0',
        amount: '1',
        dripEdgeAngleAlpha: '90',
        apronAngleBeta: '90',
    }


    function verifyInput(shape, depthE, dripEdgeHeightH, apronHeightA, widthL, thicknessG, dripEdgeAngleAlpha, apronAngleBeta) {
        const output = {
            E: '',
            H: '',
            A: '',
            L: '',
            G: false,
            AEdiv: false,
            HEdiv: false,
            EHplus: false,
            EHAplus: false,
            Alfa: '',
            Beta: '',
        };
        
        if (depthE <= MIN_DEPTH)                                            output.E = 'too_small';
        else if (depthE >= MAX_DEPTH)                                       output.E = 'too_big';
        else                                                                output.E = 'correct';

        if (dripEdgeHeightH <= MIN_DEPTH)                                   output.H = 'too_small';
        else if (dripEdgeHeightH >= MAX_DEPTH)                              output.H = 'too_big';
        else                                                                output.H = 'correct';

        if (widthL <= MIN_WIDTH)                                            output.L = 'too_small';
        else if (widthL >= MAX_WIDTH)                                       output.L = 'too_big';
        else                                                                output.L = 'correct';

        if (dripEdgeAngleAlpha <=MIN_ANGLE)                                 output.Alfa = 'too_small';
        else if (dripEdgeAngleAlpha >= MAX_ANGLE)                           output.Alfa = 'too_big';
        else                                                                output.Alfa = 'correct';

        [1.0, 1.5, 2.0, 2.5, 3.0].includes(thicknessG)                      ? output.G = true       : output.G = false;
        if(shape === 'Z' || shape === 'C')
        {
            if (apronHeightA <= MIN_DEPTH)                                  output.A = 'too_small';
            else if (apronHeightA >= MAX_DEPTH)                             output.A = 'too_big';
            else                                                            output.A = 'correct';

            if (apronAngleBeta <= MIN_ANGLE)                                output.Beta = 'too_small';
            else if (apronAngleBeta >= MAX_ANGLE)                           output.Beta = 'too_big';
            else                                                            output.Beta = 'correct';
        }

        if(shape === 'L')
        {
            if (apronHeightA !== 0)                                         output.A    = 'non_zero';
            if (apronAngleBeta !== 0)                                       output.Beta = 'non_zero';
            (depthE + dripEdgeHeightH <= MAX_DEPTH_TOTAL)                   ? output.EHplus = true  : output.EHplus = false;
            output.EHAplus = true;
            output.AEdiv = true;
            output.HEdiv = true;
        }
        else if(shape === 'Z')
        {
            (depthE + dripEdgeHeightH + apronHeightA <= MAX_DEPTH_TOTAL)    ? output.EHAplus = true : output.EHAplus = false;
            output.EHplus = true;
            output.AEdiv = true;
            output.HEdiv = true;
        }
        else if(shape === 'C')
        {
            (apronHeightA / depthE <= MAX_PROPORTION)                       ? output.AEdiv = true   : output.AEdiv = false;
            (dripEdgeHeightH / depthE <= MAX_PROPORTION)                    ? output.HEdiv = true   : output.HEdiv = false;
            (depthE + dripEdgeHeightH + apronHeightA <= MAX_DEPTH_TOTAL)    ? output.EHAplus = true : output.EHAplus = false;
            output.EHplus = true;
        }


        return output;
    }

    // function calculatePrice(shape, amount, depthE, dripEdgeHeightH, apronHeightA, widthL, thicknessG, rate)
    // {
    //     let numBends = 0;
    //     let alumArea = 0;
    //     let numPaint = 0;
    //     let weight = 0;
    //
    //     if(shape === 'L')
    //     {
    //         numBends = 1;
    //         alumArea = ((dripEdgeHeightH + depthE) * widthL) / 1000000;
    //     }
    //     else if(shape === 'C' || shape === 'Z')
    //     {
    //         numBends = 2;
    //         alumArea = ((dripEdgeHeightH + apronHeightA + depthE) * widthL) / 1000000;
    //     }
    //
    //     (amount * alumArea < 1) ? numPaint = 1 : numPaint = alumArea;
    //
    //     weight = thicknessG * alumArea * 2.7;
    //
    //
    //
    //     let mult = 0;
    //     if (amount <= 5)
    //     {
    //         mult = 1.5;
    //     }
    //     else if (amount > 5)
    //     {
    //         mult = 1.25;
    //     }
    //     else {
    //         mult = 1;
    //     }
    //
    //     const pricePerUnit = ((weight * 20) + (numBends * 20) + 30 + (numPaint * 100)) * mult;
    //     const priceTotal = pricePerUnit * amount;
    //
    //     return {perUnitPLN: pricePerUnit, totalPLN: priceTotal, perUnitGDP: pricePerUnit * rate, totalGDP: priceTotal * rate};
    // }

    return {
        opened: false,
        params: new URLSearchParams(window.location.search),
        input: {
            // shape: defaultsL.shape,
            // depthE: defaultsL.depthE,
            // dripEdgeHeightH: defaultsL.dripEdgeHeightH,
            // apronHeightA: defaultsL.apronHeightA,
            // widthL: defaultsL.widthL,
            // thicknessG: defaultsL.thicknessG,
            // amount: defaultsL.amount,
            // dripEdgeAngleAlpha: defaultsL.dripEdgeAngleAlpha,
            // apronAngleBeta: defaultsL.apronAngleBeta,
            // shape: defaultsZ.shape,
            // depthE: defaultsZ.depthE,
            // dripEdgeHeightH: defaultsZ.dripEdgeHeightH,
            // apronHeightA: defaultsZ.apronHeightA,
            // widthL: defaultsZ.widthL,
            // thicknessG: defaultsZ.thicknessG,
            // amount: defaultsZ.amount,
            // dripEdgeAngleAlpha: defaultsZ.dripEdgeAngleAlpha,
            // apronAngleBeta: defaultsZ.apronAngleBeta,
            shape: defaultsC.shape,
            depthE: defaultsC.depthE,
            dripEdgeHeightH: defaultsC.dripEdgeHeightH,
            apronHeightA: defaultsC.apronHeightA,
            widthL: defaultsC.widthL,
            thicknessG: defaultsC.thicknessG,
            amount: defaultsC.amount,
            dripEdgeAngleAlpha: defaultsC.dripEdgeAngleAlpha,
            apronAngleBeta: defaultsC.apronAngleBeta,
        },
        sendTimeout: 0,

        display: '',
        selectedColor: '',
        colorSearch: '',
        isColorActive: '',
        colors: RAL_COMPLETE_COLORSET,
        price: '',

        get data() {
            const data = {
                shape: this.input.shape,
                depthE: Number(this.input.depthE),
                dripEdgeHeightH: Number(this.input.dripEdgeHeightH),
                apronHeightA: Number(this.input.apronHeightA),
                widthL: Number(this.input.widthL),
                thicknessG: Number(this.input.thicknessG),
                amount: Number(this.input.amount),
                dripEdgeAngleAlpha: Number(this.input.dripEdgeAngleAlpha),
                apronAngleBeta: Number(this.input.apronAngleBeta),
                selectedColor: this.selectedColor,
            }

            const validation = verifyInput(data.shape, data.depthE, data.dripEdgeHeightH, data.apronHeightA, data.widthL, data.thicknessG, data.dripEdgeAngleAlpha, data.apronAngleBeta);

            const defaultSet = data.shape === 'C' ? defaultsC : data.shape === 'Z' ? defaultsZ : defaultsL;

            if(validation.E === 'too_big'  ) { data.depthE = MAX_DEPTH;                 validation.E = 'correct' }
            if(validation.H === 'too_big'  ) { data.dripEdgeHeightH = MAX_DEPTH;        validation.H = 'correct' }
            if(validation.A === 'too_big'  ) { data.apronHeightA = MAX_DEPTH;           validation.A = 'correct' }
            if(validation.E === 'too_small') { data.depthE = MIN_DEPTH;                 validation.E = 'correct' }
            if(validation.H === 'too_small') { data.dripEdgeHeightH = MIN_DEPTH;        validation.H = 'correct' }
            if(validation.A === 'too_small') { data.apronHeightA = MIN_DEPTH;           validation.A = 'correct' }
            if(validation.A === 'non_zero' ) { data.apronHeightA = 0;                   validation.A = 'correct' }
            if(validation.L === 'too_big'  ) { data.widthL = MAX_WIDTH;                 validation.L = 'correct' }
            if(validation.L === 'too_small') { data.widthL = MIN_WIDTH;                 validation.L = 'correct' }
            if(validation.G === false      ) { data.thicknessG = defaultSet.thicknessG; validation.G = true }
            if(validation.Alfa === 'too_small') { data.dripEdgeAngleAlpha = MIN_ANGLE;      validation.Alfa = 'correct' }
            if(validation.Alfa === 'too_big'  ) { data.dripEdgeAngleAlpha = MAX_ANGLE;      validation.Alfa = 'correct' }
            if(validation.Beta === 'non_zero' ) { data.apronAngleBeta = 0;                  validation.Beta = 'correct' }
            if(validation.Beta === 'too_small') { data.apronAngleBeta = MIN_ANGLE;          validation.Beta = 'correct' }
            if(validation.Beta === 'too_big'  ) { data.apronAngleBeta = MAX_ANGLE;          validation.Beta = 'correct' }
            if(validation.E === 'correct' && validation.H === 'correct')
            {
                validation.HEdiv === false ? data.dripEdgeHeightH = data.depthE * MAX_PROPORTION : '';
                validation.EHplus === false ? data.dripEdgeHeightH = (MAX_DEPTH_TOTAL - data.depthE < MAX_DEPTH ? MAX_DEPTH_TOTAL - data.depthE : MAX_DEPTH) : '';
            }
            if(validation.E === 'correct' && validation.A === 'correct')
            {
                validation.AEdiv === false ? data.apronHeightA = data.depthE * MAX_PROPORTION : '';
            }
            // if(validation.E === 'correct' && validation.A === 'correct' && validation.H === 'correct' && validation.EHAplus === false)
            // {
            //     if ((MAX_DEPTH_TOTAL - data.depthE - data.apronHeightA < MAX_DEPTH) && data.dripEdgeHeightH > data.apronHeightA) {
            //         data.dripEdgeHeightH = MAX_DEPTH_TOTAL - data.depthE - data.apronHeightA;
            //     }
            //     else if (MAX_DEPTH_TOTAL - data.depthE - data.dripEdgeHeightH < MAX_DEPTH) {
            //         data.apronHeightA = MAX_DEPTH_TOTAL - data.depthE - data.dripEdgeHeightH;
            //     }
            //     else
            //     {
            //         data.dripEdgeHeightH = MAX_DEPTH_TOTAL;
            //     }
            // }

            return data;
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

            this.input = this.data;
            this.sendDataDebounced(this.data, 'update-price').then().catch(err => console.error(err));

            let svg = '';
            switch(this.data.shape) {
                case "L":
                    // svg = this.schemeL(this.data.thicknessG, this.data.depthE, this.data.dripEdgeHeightH);
                    svg = this.schemeLAngle(this.data.thicknessG, this.data.depthE, this.data.dripEdgeHeightH, this.data.dripEdgeAngleAlpha)
                    break;
                case "Z":
                    // svg = this.schemeZ(this.data.thicknessG, this.data.depthE, this.data.dripEdgeHeightH, this.data.apronHeightA);
                    svg = this.schemeZAngle(this.data.thicknessG, this.data.depthE, this.data.dripEdgeHeightH, this.data.apronHeightA, this.data.dripEdgeAngleAlpha, this.data.apronAngleBeta);
                    break;
                case "C":
                    // svg = this.schemeC(this.data.thicknessG, this.data.depthE, this.data.dripEdgeHeightH, this.data.apronHeightA);
                    svg = this.schemeCAngle(this.data.thicknessG, this.data.depthE, this.data.dripEdgeHeightH, this.data.apronHeightA, this.data.dripEdgeAngleAlpha, this.data.apronAngleBeta);
                    break;
            }

            this.display = svg;


        },

        init () {
            document.addEventListener("DOMContentLoaded", () => {

                const urlId = this.params.get('type')

                if (urlId === 'L') {
                    this.opened = true;
                    this.input.shape = 'L';
                    this.update();
                }
                else if (urlId === 'Z') {
                    this.opened = true;
                    this.input.shape = 'Z';
                    this.update();
                }
                else if (urlId === 'C') {
                    this.opened = true;
                    this.input.shape = 'C';
                    this.update();
                }
            });
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
                    product: document.getElementById('product-type').textContent,
                    shape: String(data.shape),
                    depthE: Number(data.depthE),
                    dripEdgeHeightH: Number(data.dripEdgeHeightH),
                    apronHeightA: Number(data.apronHeightA),
                    widthL: Number(data.widthL),
                    thicknessG: Number(data.thicknessG),
                    dripEdgeAngleAlpha: Number(data.dripEdgeAngleAlpha),
                    apronAngleBeta: Number(data.apronAngleBeta),
                    amount: Number(data.amount),
                    selectedColor: data.selectedColor,
                })
            })

            let response_data = await response.json();
            if (response_data.status === 'success') {
                if(action === 'update-price')
                {
                    this.price = response_data.results;
                }
            }

        },

        schemeLAngle(widthG, widthE, widthH, angleAlfa)
        {
            const alfaRadians = (angleAlfa - 90) * Math.PI / 180;
            const positionGLabel = widthE * 0.6;
            return `
                <svg class="configurated"  
                    style="--svg-width: ${widthE + (2*SHAPE_START_X)+(Math.sin(alfaRadians) * widthH)}px"
                    viewBox="0 5 ${widthE + (2*SHAPE_START_X) + (Math.cos(alfaRadians)*5) + Math.sin(alfaRadians) * widthH} ${widthH + (2*SHAPE_START_Y) + 5}"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto-start-reverse">
                            <polygon points="0 0, 5 2.5, 0 5" fill="black" />
                        </marker>
                    </defs>
                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X}" y1="${SHAPE_START_Y}" y2="${SHAPE_START_Y + widthH + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE}" x2="${SHAPE_START_X + widthE}" y1="${SHAPE_START_Y}" y2="${SHAPE_START_Y + widthH + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE - (Math.cos(alfaRadians) * widthG)}" x2="${SHAPE_START_X + widthE + (Math.cos(alfaRadians) * MEASURING_LINE_LENGTH)}" y1="${SHAPE_START_Y + (Math.sin(alfaRadians) * widthG)}" y2="${SHAPE_START_Y - (Math.sin(alfaRadians) * MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE + (Math.sin(alfaRadians) * widthH)}" x2="${SHAPE_START_X + widthE + (Math.cos(alfaRadians) * MEASURING_LINE_LENGTH) + (Math.sin(alfaRadians) * widthH)}" y1="${SHAPE_START_Y + (Math.cos(alfaRadians) * widthH)}" y2="${SHAPE_START_Y + (Math.cos(alfaRadians) * widthH) - (Math.sin(alfaRadians) * MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>

                    <line x1="${SHAPE_START_X + widthE + (Math.cos(alfaRadians)*MEASUREMENT_MARGIN)}" x2="${SHAPE_START_X + widthE + (Math.sin(alfaRadians) * widthH) + (Math.cos(alfaRadians)*MEASUREMENT_MARGIN)}" y1="${SHAPE_START_Y-(Math.sin(alfaRadians)*MEASUREMENT_MARGIN)}" y2="${SHAPE_START_Y + (Math.cos(alfaRadians) * widthH) - (Math.sin(alfaRadians)*MEASUREMENT_MARGIN)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X + widthE + (0.5 * widthH) - 5}" y="${SHAPE_START_Y - MEASUREMENT_MARGIN}" font-size="10" font-family="sans-serif" transform="rotate(${180-angleAlfa} ${SHAPE_START_X + widthE} ${SHAPE_START_Y})">H</text> -->

                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X + widthE}" y1="${SHAPE_START_Y + widthH + MEASUREMENT_MARGIN}" y2="${SHAPE_START_Y + widthH + MEASUREMENT_MARGIN}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X + (0.5 * widthE) - 2}" y="${SHAPE_START_Y + widthH + MEASUREMENT_MARGIN - 0.5}" font-size="10" font-family="sans-serif">E</text> -->

                    <line x1="${SHAPE_START_X + positionGLabel}" x2="${SHAPE_START_X + positionGLabel}" y1="${SHAPE_START_Y}" y2="${SHAPE_START_Y-(0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
                    <line x1="${SHAPE_START_X + positionGLabel}" x2="${SHAPE_START_X + positionGLabel}" y1="${SHAPE_START_Y+widthG}" y2="${SHAPE_START_Y+widthG+(0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X + positionGLabel - 3}" y="${SHAPE_START_Y - (0.5 * MEASURING_LINE_LENGTH) - 2}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + positionGLabel} ${SHAPE_START_Y - (0.5 * MEASURING_LINE_LENGTH)})">g</text> -->
                

                    <path d="
                        M ${SHAPE_START_X} ${SHAPE_START_Y}
                        L ${SHAPE_START_X + widthE - LONG_ARC * widthG} ${SHAPE_START_Y}
                        Q ${SHAPE_START_X + widthE} ${SHAPE_START_Y}, ${SHAPE_START_X + widthE + (Math.sin(alfaRadians) * LONG_ARC * widthG)} ${SHAPE_START_Y + (Math.cos(alfaRadians) * LONG_ARC * widthG)}
                        L ${SHAPE_START_X + widthE + Math.sin(alfaRadians) * widthH} ${SHAPE_START_Y + Math.cos(alfaRadians) * widthH}
                        L ${SHAPE_START_X + widthE - Math.cos(alfaRadians) * widthG + Math.sin(alfaRadians) * widthH} ${SHAPE_START_Y + Math.cos(alfaRadians) * widthH + Math.sin(alfaRadians) * widthG}
                        L ${SHAPE_START_X + widthE - Math.cos(alfaRadians) * widthG + Math.sin(alfaRadians) * SHORT_ARC * widthG} ${SHAPE_START_Y + widthG + Math.cos(alfaRadians) * SHORT_ARC * widthG}
                        Q ${SHAPE_START_X + widthE - widthG} ${SHAPE_START_Y + widthG}, ${SHAPE_START_X + widthE - widthG - (SHORT_ARC * widthG)} ${SHAPE_START_Y + widthG}
                        L ${SHAPE_START_X} ${SHAPE_START_Y + widthG}
                        Z
                    " fill="var(--color-fill)" stroke="black" stroke-width="${BIG_STROKE_WIDTH}"/>
                </svg>
            `
        },
        schemeZAngle(widthG, widthE, widthH, widthA, angleAlfa, angleBeta)
        {
            const alfaRadians = (angleAlfa - 90) * Math.PI / 180;
            const betaRadians = (angleBeta - 90) * Math.PI / 180;


            const positionGLabel = widthE * 0.6;


            return `
                <svg class="configurated"  
                    style="--svg-width: ${widthE + (2*SHAPE_START_X) + (Math.sin(betaRadians) * widthA)}px"
                    viewBox="0 10 ${widthE + (2*SHAPE_START_X) + (Math.sin(betaRadians) * widthA) + (Math.sin(alfaRadians) *  widthH) + 5} ${widthH + widthA + (2*SHAPE_START_Y) + 5}"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto-start-reverse">
                            <polygon points="0 0, 5 2.5, 0 5" fill="black" />
                        </marker>
                    </defs>
<!--                                        E - line -->
                    <line x1="${SHAPE_START_X + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + widthA * Math.sin(betaRadians)}" y1="${SHAPE_START_Y + widthA * Math.cos(betaRadians)}" y2="${SHAPE_START_Y + widthH + widthA * Math.cos(betaRadians) + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthA * Math.sin(betaRadians) + widthE}" x2="${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians)}" y1="${SHAPE_START_Y + widthA * Math.cos(betaRadians) - widthG}" y2="${SHAPE_START_Y + widthH + widthA * Math.cos(betaRadians) + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
<!--                                        E - text-->
                    <line x1="${SHAPE_START_X + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians)}" y1="${SHAPE_START_Y + widthH  + MEASUREMENT_MARGIN + widthA * Math.cos(betaRadians)}" y2="${SHAPE_START_Y + widthH + MEASUREMENT_MARGIN + widthA * Math.cos(betaRadians)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X + (0.5 * widthE) - 2}" y="${SHAPE_START_Y + widthH + widthA + MEASUREMENT_MARGIN - 2.5}" font-size="10" font-family="sans-serif">E</text> -->

<!--                                        H - line -->
                    <line x1="${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + widthE + MEASURING_LINE_LENGTH * Math.cos(alfaRadians) + widthA * Math.sin(betaRadians)}" y1="${SHAPE_START_Y + widthA * Math.cos(betaRadians) - widthG}" y2="${SHAPE_START_Y + widthA * Math.cos(betaRadians) - widthG - MEASURING_LINE_LENGTH * Math.sin(alfaRadians) }" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians) + widthH * Math.sin(alfaRadians)}" x2="${SHAPE_START_X + widthE + MEASURING_LINE_LENGTH * Math.cos(alfaRadians) + widthA * Math.sin(betaRadians) + widthH * Math.sin(alfaRadians)}" y1="${SHAPE_START_Y + widthH * Math.cos(alfaRadians) + widthA * Math.cos(betaRadians) - widthG * Math.sin(alfaRadians)}" y2="${SHAPE_START_Y + widthH * Math.cos(alfaRadians) + widthA * Math.cos(betaRadians) - MEASURING_LINE_LENGTH * Math.sin(alfaRadians) - widthG * Math.sin(alfaRadians)}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
<!--                                        H - text -->
                    <line x1="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN * Math.cos(alfaRadians) + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN * Math.cos(alfaRadians) + widthA * Math.sin(betaRadians) + widthH * Math.sin(alfaRadians)}" y1="${SHAPE_START_Y + widthA * Math.cos(betaRadians) - widthG - MEASUREMENT_MARGIN * Math.sin(alfaRadians)}" y2="${SHAPE_START_Y + widthH * Math.cos(alfaRadians) + widthA * Math.cos(betaRadians) - MEASUREMENT_MARGIN * Math.sin(alfaRadians) - widthG * Math.sin(alfaRadians)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN - 2.25}" y="${SHAPE_START_Y + widthA - widthG + (0.5 * widthH) - 0.5}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + widthE + MEASUREMENT_MARGIN} ${SHAPE_START_Y + widthA - widthG  + (0.5 * widthH)})">H</text> -->

<!--                                        A - line -->
                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X - MEASURING_LINE_LENGTH * Math.cos(betaRadians)}" y1="${SHAPE_START_Y}" y2="${SHAPE_START_Y + MEASURING_LINE_LENGTH * Math.sin(betaRadians)}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + widthA * Math.sin(betaRadians) - MEASURING_LINE_LENGTH * Math.cos(betaRadians)}" y1="${SHAPE_START_Y + widthA * Math.cos(betaRadians)}" y2="${SHAPE_START_Y + widthA * Math.cos(betaRadians) + MEASURING_LINE_LENGTH * Math.sin(betaRadians)}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
<!--                                        A - text -->
                    <line x1="${SHAPE_START_X - MEASUREMENT_MARGIN * Math.cos(betaRadians)}" x2="${SHAPE_START_X - MEASUREMENT_MARGIN * Math.cos(betaRadians) + widthA * Math.sin(betaRadians)}" y1="${SHAPE_START_Y + MEASUREMENT_MARGIN * Math.sin(betaRadians)}" y2="${SHAPE_START_Y + widthA * Math.cos(betaRadians) + MEASUREMENT_MARGIN * Math.sin(betaRadians)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X - MEASUREMENT_MARGIN - 2}" y="${SHAPE_START_Y + (0.5 * widthA) - 0.5}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X - MEASUREMENT_MARGIN} ${SHAPE_START_Y + (0.5 * widthA)})">A</text> -->

<!--                                        G - lext -->
                    <line x1="${SHAPE_START_X + positionGLabel + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + positionGLabel + widthA * Math.sin(betaRadians)}" y1="${SHAPE_START_Y + widthA * Math.cos(betaRadians) - widthG}" y2="${SHAPE_START_Y + widthA * Math.cos(betaRadians) - widthG - (0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
                    <line x1="${SHAPE_START_X + positionGLabel + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + positionGLabel + widthA * Math.sin(betaRadians)}" y1="${SHAPE_START_Y + widthA * Math.cos(betaRadians)}" y2="${SHAPE_START_Y + widthA * Math.cos(betaRadians) + (0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X + positionGLabel + (0.3 * MEASURING_LINE_LENGTH)}" y="${SHAPE_START_Y + widthA - widthG - 2}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + positionGLabel} ${SHAPE_START_Y + widthA - widthG})">g</text> -->

                    <path d="
                        M ${SHAPE_START_X} ${SHAPE_START_Y}
                        L ${SHAPE_START_X + Math.cos(betaRadians) * widthG} ${SHAPE_START_Y - Math.sin(betaRadians) * widthG}
                        L ${SHAPE_START_X + Math.cos(betaRadians) * widthG + Math.sin(betaRadians) * widthA} ${SHAPE_START_Y + Math.cos(betaRadians) * widthA - widthG}
                        L ${SHAPE_START_X + Math.sin(betaRadians) * widthA + widthE} ${SHAPE_START_Y + Math.cos(betaRadians) * widthA - widthG}
                        L ${SHAPE_START_X + Math.sin(betaRadians) * widthA + widthE + Math.sin(alfaRadians) * widthH} ${SHAPE_START_Y + Math.cos(betaRadians) * widthA - Math.sin(alfaRadians) * widthG + Math.cos(alfaRadians) * widthH}
                        L ${SHAPE_START_X + Math.sin(betaRadians) * widthA + widthE - Math.cos(alfaRadians) * widthG + Math.sin(alfaRadians) * widthH} ${SHAPE_START_Y + Math.cos(betaRadians) * widthA + Math.cos(alfaRadians) * widthH}
                        L ${SHAPE_START_X + Math.sin(betaRadians) * widthA + widthE - Math.cos(alfaRadians) * widthG} ${SHAPE_START_Y + Math.cos(betaRadians) * widthA}
                        L ${SHAPE_START_X + Math.sin(betaRadians) * widthA} ${SHAPE_START_Y + Math.cos(betaRadians) * widthA}
                        Z
                    " fill="var(--color-fill)" stroke="black" stroke-width="${BIG_STROKE_WIDTH}"/>
                </svg>
            `
        },
        schemeCAngle(widthG, widthE, widthH, widthA, angleAlfa, angleBeta)
        {

            let bigger = 0;
            let smaller = 0;
            let left = false;
            if (widthA > widthH) {
                left = false;
                bigger = widthA
                smaller = widthH;
            }
            else {
               left = true;
               bigger = widthH;
               smaller = widthA;
            }

            const difference = bigger - smaller;

            const alfaRadians = (angleAlfa - 90) * Math.PI / 180;
            const betaRadians = (angleBeta - 90) * Math.PI / 180;

            const positionGLabel = widthE * 0.6;

            return `
                <svg class="configurated"  
                    style="--svg-width: ${widthE + (2*SHAPE_START_X)}px"
                    viewBox="0 5 ${widthE + (2*SHAPE_START_X) + 5 + widthA * Math.sin(betaRadians) + widthH * Math.sin(alfaRadians)} ${(widthA >= widthH ? widthA : widthH) + (2*SHAPE_START_Y) + 5}"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg">
                                    
                    <defs>
                        <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto-start-reverse">
                            <polygon points="0 0, 5 2.5, 0 5" fill="black" />
                        </marker>
                    </defs>
                    <path d="
                        M ${SHAPE_START_X} ${left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y}
                        L ${SHAPE_START_X + widthG * Math.cos(betaRadians)} ${left ? SHAPE_START_Y + widthH - widthA - widthG * Math.sin(betaRadians) : SHAPE_START_Y - widthG * Math.sin(betaRadians)}
                        L ${SHAPE_START_X + widthG * Math.cos(betaRadians) + widthA * Math.sin(betaRadians)} ${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference - widthG : SHAPE_START_Y + bigger * Math.cos(betaRadians) - widthG}
                        L ${SHAPE_START_X + widthE - widthG * Math.cos(alfaRadians) + widthA * Math.sin(betaRadians)} ${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference - widthG : SHAPE_START_Y + bigger * Math.cos(betaRadians) - widthG}
                        L ${SHAPE_START_X + widthE - widthG * Math.cos(alfaRadians) + widthA * Math.sin(betaRadians) + widthH * Math.sin(alfaRadians)} ${left ? SHAPE_START_Y - widthA * Math.sin(betaRadians) + widthH * (1 - Math.cos(alfaRadians)) - widthG * Math.sin(alfaRadians) : SHAPE_START_Y - widthH * Math.cos(alfaRadians) + widthA * Math.cos(betaRadians) - widthG * Math.sin(alfaRadians)}
                        L ${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians) + widthH * Math.sin(alfaRadians)} ${left ? SHAPE_START_Y - widthA * Math.sin(betaRadians) + widthH * (1 - Math.cos(alfaRadians)) : SHAPE_START_Y - widthH * Math.cos(alfaRadians) + widthA * Math.cos(betaRadians)}
                        L ${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians)} ${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference : SHAPE_START_Y + bigger * Math.cos(betaRadians)}
                        L ${SHAPE_START_X + widthA * Math.sin(betaRadians)} ${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference : SHAPE_START_Y + bigger * Math.cos(betaRadians)}
                        Z
                    " fill="var(--color-fill)" stroke="black" stroke-width="${BIG_STROKE_WIDTH}"/>
<!--                    E - line -->
                    <line x1="${SHAPE_START_X + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + widthA * Math.sin(betaRadians)}" y1="${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference : SHAPE_START_Y + bigger * Math.cos(betaRadians)}" y2="${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference + MEASURING_LINE_LENGTH : SHAPE_START_Y + bigger * Math.cos(betaRadians) + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians)}" y1="${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference : SHAPE_START_Y + bigger * Math.cos(betaRadians)}" y2="${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference + MEASURING_LINE_LENGTH : SHAPE_START_Y + bigger * Math.cos(betaRadians) + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
<!--                    E - txt -->
                    <line x1="${SHAPE_START_X + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians)}" y1="${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference + MEASUREMENT_MARGIN : SHAPE_START_Y + bigger * Math.cos(betaRadians) + MEASUREMENT_MARGIN}" y2="${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference + MEASUREMENT_MARGIN : SHAPE_START_Y + bigger * Math.cos(betaRadians) + MEASUREMENT_MARGIN}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X + (0.5 * widthE) - 2}" y="${SHAPE_START_Y + bigger + MEASUREMENT_MARGIN - 0.5}" font-size="10" font-family="sans-serif">E</text> -->

<!--                    H - line-->
                    <line x1="${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians) + widthH * Math.sin(alfaRadians)}" x2="${SHAPE_START_X + widthE + MEASURING_LINE_LENGTH * Math.cos(alfaRadians) + widthA * Math.sin(betaRadians) + widthH * Math.sin(alfaRadians) }" y1="${left ? SHAPE_START_Y - widthA + widthA * Math.cos(betaRadians ) + widthH * (1-Math.cos(alfaRadians)) : SHAPE_START_Y - widthH + widthA * Math.cos(betaRadians) + widthH * (1-Math.cos(alfaRadians))}" y2="${left ? SHAPE_START_Y - widthA + widthA * Math.cos(betaRadians) + widthH * (1-Math.cos(alfaRadians)) + MEASURING_LINE_LENGTH * Math.sin(alfaRadians): SHAPE_START_Y - widthH + widthA * Math.cos(betaRadians) + widthH * (1-Math.cos(alfaRadians)) + MEASURING_LINE_LENGTH * Math.sin(alfaRadians)}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + widthE + MEASURING_LINE_LENGTH * Math.cos(alfaRadians) + widthA * Math.sin(betaRadians)}" y1="${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference : SHAPE_START_Y + bigger * Math.cos(betaRadians)}" y2="${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference + MEASURING_LINE_LENGTH * Math.sin(alfaRadians) : SHAPE_START_Y + bigger * Math.cos(betaRadians) + MEASURING_LINE_LENGTH * Math.sin(alfaRadians)}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
<!--                    H - txt -->
                    <line x1="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN * Math.cos(alfaRadians) + widthA * Math.sin(betaRadians) + widthH * Math.sin(alfaRadians)}" x2="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN * Math.cos(alfaRadians) + widthA * Math.sin(betaRadians)}" y1="${left ? SHAPE_START_Y - widthA + widthA * Math.cos(betaRadians) + MEASUREMENT_MARGIN * Math.sin(alfaRadians) + widthH * (1 - Math.cos(alfaRadians)) : SHAPE_START_Y - widthH + widthA * Math.cos(betaRadians) + MEASUREMENT_MARGIN * Math.sin(alfaRadians) + widthH * (1 - Math.cos(alfaRadians))}" y2="${left ? SHAPE_START_Y + smaller * Math.cos(betaRadians) + difference + MEASUREMENT_MARGIN * Math.sin(alfaRadians) : SHAPE_START_Y + bigger * Math.cos(betaRadians) + MEASUREMENT_MARGIN * Math.sin(alfaRadians)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN - 2}" y="${0.5*((left ? SHAPE_START_Y : SHAPE_START_Y - widthH + widthA )+(SHAPE_START_Y + bigger))-0.5}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + widthE + MEASUREMENT_MARGIN} ${0.5*((left ? SHAPE_START_Y : SHAPE_START_Y - widthH + widthA)+(SHAPE_START_Y + bigger))})">H</text> -->

<!--                    A - line -->
                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X - MEASURING_LINE_LENGTH * Math.cos(betaRadians)}" y1="${left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y}" y2="${left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y + MEASURING_LINE_LENGTH * Math.sin(betaRadians)}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + widthA * Math.sin(betaRadians) - MEASURING_LINE_LENGTH * Math.cos(betaRadians)}" y1="${SHAPE_START_Y + bigger * Math.cos(betaRadians)}" y2="${SHAPE_START_Y + bigger * Math.cos(betaRadians) + MEASURING_LINE_LENGTH * Math.sin(betaRadians)}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
<!--                    A - txt -->
                    <line x1="${SHAPE_START_X - MEASUREMENT_MARGIN * Math.cos(betaRadians)}" x2="${SHAPE_START_X - MEASUREMENT_MARGIN * Math.cos(betaRadians) + widthA * Math.sin(betaRadians)}" y1="${left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y + MEASUREMENT_MARGIN * Math.sin(betaRadians)}" y2="${SHAPE_START_Y + bigger * Math.cos(betaRadians) + MEASUREMENT_MARGIN * Math.sin(betaRadians)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X - MEASUREMENT_MARGIN - 2}" y="${0.5*((left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y)+(SHAPE_START_Y + bigger))-0.5}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X - MEASUREMENT_MARGIN} ${0.5*((left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y)+(SHAPE_START_Y + bigger))})">A</text> -->
            
<!--                    G - txt -->
                    <line x1="${SHAPE_START_X + positionGLabel + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + positionGLabel + widthA * Math.sin(betaRadians)}" y1="${left ? SHAPE_START_Y+smaller*Math.cos(betaRadians)-widthG + difference : SHAPE_START_Y+bigger*Math.cos(betaRadians)-widthG}" y2="${left ? SHAPE_START_Y+smaller * Math.cos(betaRadians)-widthG-(0.5*MEASURING_LINE_LENGTH) + difference: SHAPE_START_Y+bigger * Math.cos(betaRadians)-widthG-(0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
                    <line x1="${SHAPE_START_X + positionGLabel + widthA * Math.sin(betaRadians)}" x2="${SHAPE_START_X + positionGLabel + widthA * Math.sin(betaRadians)}" y1="${left ? SHAPE_START_Y+smaller*Math.cos(betaRadians) + difference : SHAPE_START_Y+bigger*Math.cos(betaRadians)}" y2="${left ? SHAPE_START_Y+smaller * Math.cos(betaRadians)+(0.5*MEASURING_LINE_LENGTH) + difference: SHAPE_START_Y+bigger * Math.cos(betaRadians)+(0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
<!--                <text x="${SHAPE_START_X + positionGLabel + (0.3 * MEASURING_LINE_LENGTH)}" y="${SHAPE_START_Y + bigger - widthG - 2}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + positionGLabel} ${SHAPE_START_Y + bigger - widthG})">g</text> -->
                </svg>
            `
        },
        schemeL(widthG, widthE, widthH) {
            const positionGLabel = widthE * 0.6;
            return `
                <svg class="configurated"  
                    style="--svg-width: ${widthE + (2*SHAPE_START_X)}px"
                    viewBox="0 5 ${widthE + (2*SHAPE_START_X) + 5} ${widthH + (2*SHAPE_START_Y) + 5}"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto-start-reverse">
                            <polygon points="0 0, 5 2.5, 0 5" fill="black" />
                        </marker>
                    </defs>

                    <path d="
                        M ${SHAPE_START_X} ${SHAPE_START_Y}
                        L ${SHAPE_START_X + widthE - (LONG_ARC * widthG)} ${SHAPE_START_Y}
                        Q ${SHAPE_START_X + widthE} ${SHAPE_START_Y}, ${SHAPE_START_X + widthE} ${SHAPE_START_Y + (LONG_ARC * widthG)}
                        L ${SHAPE_START_X + widthE} ${SHAPE_START_Y + widthH}
                        L ${SHAPE_START_X + widthE - widthG} ${SHAPE_START_Y + widthH}
                        L ${SHAPE_START_X + widthE - widthG} ${SHAPE_START_Y + (SHORT_ARC * widthG) + widthG}
                        Q ${SHAPE_START_X + widthE - widthG} ${SHAPE_START_Y + widthG}, ${SHAPE_START_X + widthE - widthG - (SHORT_ARC * widthG)} ${SHAPE_START_Y + widthG}
                        L ${SHAPE_START_X} ${SHAPE_START_Y + widthG}
                        Z
                    " fill="var(--color-fill)" stroke="black" stroke-width="${BIG_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X}" y1="${SHAPE_START_Y}" y2="${SHAPE_START_Y + widthH + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE}" x2="${SHAPE_START_X + widthE}" y1="${SHAPE_START_Y + (LONG_ARC * widthG)}" y2="${SHAPE_START_Y + widthH + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE-(LONG_ARC * widthG)}" x2="${SHAPE_START_X + widthE + MEASURING_LINE_LENGTH}" y1="${SHAPE_START_Y}" y2="${SHAPE_START_Y}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE}" x2="${SHAPE_START_X + widthE + MEASURING_LINE_LENGTH}" y1="${SHAPE_START_Y + widthH}" y2="${SHAPE_START_Y + widthH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>

                    <line x1="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN}" x2="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN}" y1="${SHAPE_START_Y}" y2="${SHAPE_START_Y + widthH}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN - 2.25}" y="${SHAPE_START_Y + (0.5 * widthH) - 0.5}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + widthE + MEASUREMENT_MARGIN} ${SHAPE_START_Y + (0.5 * widthH)})">H</text>

                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X + widthE}" y1="${SHAPE_START_Y + widthH + MEASUREMENT_MARGIN}" y2="${SHAPE_START_Y + widthH + MEASUREMENT_MARGIN}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X + (0.5 * widthE) - 2}" y="${SHAPE_START_Y + widthH + MEASUREMENT_MARGIN - 0.5}" font-size="10" font-family="sans-serif">E</text>

                    <line x1="${SHAPE_START_X + positionGLabel}" x2="${SHAPE_START_X + positionGLabel}" y1="${SHAPE_START_Y}" y2="${SHAPE_START_Y-(0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
                    <line x1="${SHAPE_START_X + positionGLabel}" x2="${SHAPE_START_X + positionGLabel}" y1="${SHAPE_START_Y+widthG}" y2="${SHAPE_START_Y+widthG+(0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X + positionGLabel - 3}" y="${SHAPE_START_Y - (0.5 * MEASURING_LINE_LENGTH) - 2}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + positionGLabel} ${SHAPE_START_Y - (0.5 * MEASURING_LINE_LENGTH)})">g</text>
                </svg>
            `
        },
        schemeZ(widthG, widthE, widthH, widthA)
        {
            const positionGLabel = widthE * 0.6;
            return `
                <svg class="configurated"  
                    style="--svg-width: ${widthE + (2*SHAPE_START_X)}px"
                    viewBox="0 10 ${widthE + (2*SHAPE_START_X) + 5} ${widthH + widthA + (2*SHAPE_START_Y) + 5}"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto-start-reverse">
                            <polygon points="0 0, 5 2.5, 0 5" fill="black" />
                        </marker>
                    </defs>
                    <path d="
                        M ${SHAPE_START_X} ${SHAPE_START_Y}
                        L ${SHAPE_START_X + widthG} ${SHAPE_START_Y}
                        L ${SHAPE_START_X + widthG} ${SHAPE_START_Y + widthA - widthG - (SHORT_ARC * widthG)}
                        Q ${SHAPE_START_X + widthG} ${SHAPE_START_Y + widthA - widthG}, ${SHAPE_START_X + widthG + (SHORT_ARC * widthG)} ${SHAPE_START_Y + widthA - widthG}
                        L ${SHAPE_START_X + widthE - (LONG_ARC * widthG)} ${SHAPE_START_Y + widthA - widthG}
                        Q ${SHAPE_START_X + widthE} ${SHAPE_START_Y + widthA - widthG}, ${SHAPE_START_X + widthE} ${SHAPE_START_Y + widthA - widthG + (LONG_ARC * widthG)}
                        L ${SHAPE_START_X + widthE} ${SHAPE_START_Y + widthA + widthH - widthG}
                        L ${SHAPE_START_X + widthE - widthG} ${SHAPE_START_Y + widthA + widthH - widthG}
                        L ${SHAPE_START_X + widthE - widthG} ${SHAPE_START_Y + widthA + (SHORT_ARC * widthG)}
                        Q ${SHAPE_START_X + widthE - widthG} ${SHAPE_START_Y + widthA}, ${SHAPE_START_X + widthE - widthG - (SHORT_ARC * widthG)} ${SHAPE_START_Y + widthA}
                        L ${SHAPE_START_X + (LONG_ARC * widthG)} ${SHAPE_START_Y + widthA}
                        Q ${SHAPE_START_X} ${SHAPE_START_Y + widthA}, ${SHAPE_START_X} ${SHAPE_START_Y + widthA - (LONG_ARC * widthG)}
                        Z
                    " fill="var(--color-fill)" stroke="black" stroke-width="${BIG_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X}" y1="${SHAPE_START_Y + widthA - (LONG_ARC * widthG)}" y2="${SHAPE_START_Y + widthH + widthA + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE}" x2="${SHAPE_START_X + widthE}" y1="${SHAPE_START_Y + widthA + widthH - widthG}" y2="${SHAPE_START_Y + widthH + widthA + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE - (LONG_ARC * widthG)}" x2="${SHAPE_START_X + widthE + MEASURING_LINE_LENGTH}" y1="${SHAPE_START_Y + widthA - widthG}" y2="${SHAPE_START_Y + widthA - widthG}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE}" x2="${SHAPE_START_X + widthE + MEASURING_LINE_LENGTH}" y1="${SHAPE_START_Y + widthH + widthA - widthG}" y2="${SHAPE_START_Y + widthH + widthA - widthG}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X - MEASURING_LINE_LENGTH}" y1="${SHAPE_START_Y}" y2="${SHAPE_START_Y}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + (LONG_ARC * widthG)}" x2="${SHAPE_START_X - MEASURING_LINE_LENGTH}" y1="${SHAPE_START_Y + widthA}" y2="${SHAPE_START_Y + widthA}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>

                    <line x1="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN}" x2="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN}" y1="${SHAPE_START_Y + widthA - widthG}" y2="${SHAPE_START_Y + widthH + widthA - widthG}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN - 2.25}" y="${SHAPE_START_Y + widthA - widthG + (0.5 * widthH) - 0.5}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + widthE + MEASUREMENT_MARGIN} ${SHAPE_START_Y + widthA - widthG  + (0.5 * widthH)})">H</text>

                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X + widthE}" y1="${SHAPE_START_Y + widthH + widthA + MEASUREMENT_MARGIN - 2}" y2="${SHAPE_START_Y + widthH + widthA + MEASUREMENT_MARGIN - 2}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X + (0.5 * widthE) - 2}" y="${SHAPE_START_Y + widthH + widthA + MEASUREMENT_MARGIN - 2.5}" font-size="10" font-family="sans-serif">E</text>

                    <line x1="${SHAPE_START_X - MEASUREMENT_MARGIN}" x2="${SHAPE_START_X - MEASUREMENT_MARGIN}" y1="${SHAPE_START_Y}" y2="${SHAPE_START_Y + widthA}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X - MEASUREMENT_MARGIN - 2}" y="${SHAPE_START_Y + (0.5 * widthA) - 0.5}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X - MEASUREMENT_MARGIN} ${SHAPE_START_Y + (0.5 * widthA)})">A</text>

                    <line x1="${SHAPE_START_X + positionGLabel}" x2="${SHAPE_START_X + positionGLabel}" y1="${SHAPE_START_Y+widthA-widthG}" y2="${SHAPE_START_Y+widthA-widthG-(0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
                    <line x1="${SHAPE_START_X + positionGLabel}" x2="${SHAPE_START_X + positionGLabel}" y1="${SHAPE_START_Y+widthA}" y2="${SHAPE_START_Y+widthA+(0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X + positionGLabel + (0.3 * MEASURING_LINE_LENGTH)}" y="${SHAPE_START_Y + widthA - widthG - 2}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + positionGLabel} ${SHAPE_START_Y + widthA - widthG})">g</text>

                </svg>
            `
        },
        schemeC(widthG, widthE, widthH, widthA) {

            let bigger = 0;
            let left = false;
            if (widthA > widthH) {
                left = false;
                bigger = widthA;
            }
            else {
               left = true;
               bigger = widthH
            }

            const positionGLabel = widthE * 0.6;

            return `
                <svg class="configurated"  
                    style="--svg-width: ${widthE + (2*SHAPE_START_X)}px"
                    viewBox="0 5 ${widthE + (2*SHAPE_START_X) + 5} ${(widthA >= widthH ? widthA : widthH) + (2*SHAPE_START_Y) + 5}"
                    preserveAspectRatio="xMidYMid meet"
                    xmlns="http://www.w3.org/2000/svg">
                                    
                    <defs>
                        <marker id="arrowhead" markerWidth="5" markerHeight="5" refX="5" refY="2.5" orient="auto-start-reverse">
                            <polygon points="0 0, 5 2.5, 0 5" fill="black" />
                        </marker>
                    </defs>
                    <path d="
                        M ${SHAPE_START_X} ${left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y}
                        L ${SHAPE_START_X + widthG} ${left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y}
                        L ${SHAPE_START_X + widthG} ${SHAPE_START_Y + bigger - widthG - (SHORT_ARC * widthG)}
                        Q ${SHAPE_START_X + widthG} ${SHAPE_START_Y + bigger - widthG}, ${SHAPE_START_X + widthG + (SHORT_ARC * widthG)} ${SHAPE_START_Y + bigger - widthG}
                        L ${SHAPE_START_X + widthE - widthG - (SHORT_ARC * widthG)} ${SHAPE_START_Y + bigger - widthG}
                        Q ${SHAPE_START_X + widthE - widthG} ${SHAPE_START_Y + bigger - widthG}, ${SHAPE_START_X + widthE - widthG} ${SHAPE_START_Y + bigger - widthG - (SHORT_ARC * widthG)}
                        L ${SHAPE_START_X + widthE - widthG} ${left ? SHAPE_START_Y : SHAPE_START_Y - widthH + widthA}
                        L ${SHAPE_START_X + widthE} ${left ? SHAPE_START_Y : SHAPE_START_Y - widthH + widthA}
                        L ${SHAPE_START_X + widthE} ${SHAPE_START_Y + bigger - (LONG_ARC * widthG)}
                        Q ${SHAPE_START_X + widthE} ${SHAPE_START_Y + bigger}, ${SHAPE_START_X + widthE - (LONG_ARC * widthG)} ${SHAPE_START_Y + bigger}
                        L ${SHAPE_START_X + (LONG_ARC * widthG)} ${SHAPE_START_Y + bigger}
                        Q ${SHAPE_START_X} ${SHAPE_START_Y + bigger}, ${SHAPE_START_X} ${SHAPE_START_Y + bigger - (LONG_ARC * widthG)}
                        Z
                    " fill="var(--color-fill)" stroke="black" stroke-width="${BIG_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X}" y1="${SHAPE_START_Y + bigger - (LONG_ARC * widthG)}" y2="${SHAPE_START_Y + bigger + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE}" x2="${SHAPE_START_X + widthE}" y1="${SHAPE_START_Y + bigger - (LONG_ARC * widthG)}" y2="${SHAPE_START_Y + bigger + MEASURING_LINE_LENGTH}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE}" x2="${SHAPE_START_X + widthE + MEASURING_LINE_LENGTH}" y1="${left ? SHAPE_START_Y : SHAPE_START_Y - widthH + widthA}" y2="${left ? SHAPE_START_Y : SHAPE_START_Y - widthH + widthA}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + widthE - (LONG_ARC * widthG)}" x2="${SHAPE_START_X + widthE + MEASURING_LINE_LENGTH}" y1="${SHAPE_START_Y + bigger}" y2="${SHAPE_START_Y + bigger}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X - MEASURING_LINE_LENGTH}" y1="${left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y}" y2="${left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>
                    <line x1="${SHAPE_START_X + (LONG_ARC * widthG)}" x2="${SHAPE_START_X - MEASURING_LINE_LENGTH}" y1="${SHAPE_START_Y + bigger}" y2="${SHAPE_START_Y + bigger}" stroke="black" stroke-width="${SMALL_STROKE_WIDTH}"/>

                    <line x1="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN}" x2="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN}" y1="${left ? SHAPE_START_Y : SHAPE_START_Y - widthH + widthA}" y2="${SHAPE_START_Y + bigger}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X + widthE + MEASUREMENT_MARGIN - 2}" y="${0.5*((left ? SHAPE_START_Y : SHAPE_START_Y - widthH + widthA )+(SHAPE_START_Y + bigger))-0.5}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + widthE + MEASUREMENT_MARGIN} ${0.5*((left ? SHAPE_START_Y : SHAPE_START_Y - widthH + widthA)+(SHAPE_START_Y + bigger))})">H</text>

                    <line x1="${SHAPE_START_X}" x2="${SHAPE_START_X + widthE}" y1="${SHAPE_START_Y + bigger + MEASUREMENT_MARGIN}" y2="${SHAPE_START_Y + bigger + MEASUREMENT_MARGIN}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X + (0.5 * widthE) - 2}" y="${SHAPE_START_Y + bigger + MEASUREMENT_MARGIN - 0.5}" font-size="10" font-family="sans-serif">E</text>

                    <line x1="${SHAPE_START_X - MEASUREMENT_MARGIN}" x2="${SHAPE_START_X - MEASUREMENT_MARGIN}" y1="${left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y}" y2="${SHAPE_START_Y + bigger}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)" marker-end="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X - MEASUREMENT_MARGIN - 2}" y="${0.5*((left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y)+(SHAPE_START_Y + bigger))-0.5}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X - MEASUREMENT_MARGIN} ${0.5*((left ? SHAPE_START_Y + widthH - widthA : SHAPE_START_Y)+(SHAPE_START_Y + bigger))})">A</text>

                    <line x1="${SHAPE_START_X + positionGLabel}" x2="${SHAPE_START_X + positionGLabel}" y1="${SHAPE_START_Y+bigger-widthG}" y2="${SHAPE_START_Y+bigger-widthG-(0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
                    <line x1="${SHAPE_START_X + positionGLabel}" x2="${SHAPE_START_X + positionGLabel}" y1="${SHAPE_START_Y+bigger}" y2="${SHAPE_START_Y+bigger+(0.5*MEASURING_LINE_LENGTH)}" stroke="black" stroke-width="${BIG_STROKE_WIDTH}" marker-start="url(#arrowhead)"/>
                    <text x="${SHAPE_START_X + positionGLabel + (0.3 * MEASURING_LINE_LENGTH)}" y="${SHAPE_START_Y + bigger - widthG - 2}" font-size="10" font-family="sans-serif" transform="rotate(-90 ${SHAPE_START_X + positionGLabel} ${SHAPE_START_Y + bigger - widthG})">g</text>
                </svg>
            `
        },
    }
}
