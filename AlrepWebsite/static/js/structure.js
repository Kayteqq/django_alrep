const Y_TOP_OPEN = 1;
const Y_TOP_CLOSED = 3.5;
const Y_BOTTOM_OPEN = 26;
const Y_BOTTOM_CLOSED = 23.5;
const Y_MIDDLE = 13.5;
const X_LEFT_OPEN = 3.5;
const X_RIGHT_OPEN = 28.5;
const X_LEFT_CLOSED = 1;
const X_RIGHT_CLOSED = 31;
const X_MIDDLE = 16.0;

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));


window.addEventListener('load', () => {
  const header = document.querySelector('.header');
  if (header) {
    header.classList.add('is-loaded');
  }
});


function navbar() {
  return {
    mobileMenuOpen: false,
    mobileMenuDisabled: true,
    mobileTl: null,
    proxy: { p: 0 },
    schemeData: {
      line_1_y1: Y_TOP_CLOSED,
      line_1_y2: Y_TOP_CLOSED,
      line_2_x1: X_LEFT_CLOSED,
      line_2_x2: X_RIGHT_CLOSED,
      line_3_y1: Y_BOTTOM_CLOSED,
      line_3_y2: Y_BOTTOM_CLOSED,

      line_13_x1: X_LEFT_CLOSED,
      line_13_x2: X_RIGHT_CLOSED,
    },


    updateSchemeData(point) {
      point = 1 - point;

      this.schemeData.line_1_y1 = Y_TOP_CLOSED * (point) + Y_TOP_OPEN * (1 - point);
      this.schemeData.line_1_y2 = Y_TOP_CLOSED * (point) + Y_BOTTOM_OPEN * (1 - point);
      this.schemeData.line_2_x1 = X_LEFT_CLOSED * (point) + X_MIDDLE * (1 - point);
      this.schemeData.line_2_x2 = X_RIGHT_CLOSED * (point) + X_MIDDLE * (1 - point);
      this.schemeData.line_3_y1 = Y_BOTTOM_CLOSED * (point) + Y_BOTTOM_OPEN * (1 - point);
      this.schemeData.line_3_y2 = Y_BOTTOM_CLOSED * (point) + Y_TOP_OPEN * (1 - point);
      this.schemeData.line_13_x1 = X_LEFT_CLOSED * (point) + X_LEFT_OPEN * (1 - point);
      this.schemeData.line_13_x2 = X_RIGHT_CLOSED * (point) + X_RIGHT_OPEN * (1 - point);

    },

    init() {
      this.mobileTl = gsap.timeline({ paused: true }).to(this.proxy,
        {
          p: 1,
          duration: 0.3,
          ease: 'power3.inOut',
          onUpdate: () => {
            this.updateSchemeData(this.proxy.p);
          }
        }
      );
    },

    async burgerToggle() {
      if (this.mobileTl.progress() === 1) this.mobileTl.reverse();
      else if (this.mobileTl.progress() === 0) this.mobileTl.play();

      if (this.mobileMenuDisabled)
      {
        this.mobileMenuDisabled = false;
        await sleep(10)
        if(!this.mobileMenuOpen) this.mobileMenuOpen = true;
      }
      else
      {
        if(this.mobileMenuOpen) this.mobileMenuOpen = false;
        await sleep(300)
        this.mobileMenuDisabled = true;
      }
    },

    get burgerScheme() {
      return `
        <svg xmlns="http://www.w3.org/2000/svg"  viewBox=" ${X_LEFT_CLOSED-1} ${Y_TOP_OPEN-1} ${X_RIGHT_CLOSED+1} ${Y_BOTTOM_OPEN+1}">
          <g>
            <line
                x1="${this.schemeData.line_13_x1}" y1="${this.schemeData.line_1_y1}"
                x2="${this.schemeData.line_13_x2}" y2="${this.schemeData.line_1_y2}"
                stroke-linecap="round" stroke-width="1.5" stroke="#E38074"/
            />
            <line
                x1="${this.schemeData.line_2_x1}" y1="${Y_MIDDLE}"
                x2="${this.schemeData.line_2_x2}" y2="${Y_MIDDLE}"
                stroke-linecap="round" stroke-width="1.5" stroke="#E38074"
            />
            <line
                x1="${this.schemeData.line_13_x1}" y1="${this.schemeData.line_3_y1}"
                x2="${this.schemeData.line_13_x2}" y2="${this.schemeData.line_3_y2}"
                stroke-linecap="round" stroke-width="1.5" stroke="#E38074"
            />
          </g>
        </svg>
      `
    },
  }
}