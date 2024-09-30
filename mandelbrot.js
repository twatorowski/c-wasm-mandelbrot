/* how much are we zooming in or zooming out when using mouse wheel */
const ZOOM_FACTOR = 1.5;
/* best looking aspect ratio ( width / height ) */
const ASPECT_RATIO = 4 / 2;

/* color PALETTE used for displaying the set. this is a specification of a 
 * evenly-spaced linear gradient. colors are given as 0xrrggbbaa */
const PALETTE = [
    [ 0x14, 0x0b, 0x34, 0xff ],
    [ 0x83, 0x3a, 0xb4, 0xff ],
    [ 0xc1, 0x35, 0x84, 0xff ],
    [ 0xe1, 0x30, 0x6c, 0xff ],
    [ 0xfd, 0x1d, 0x1d, 0xff ],
    [ 0xf5, 0x60, 0x40, 0xff ],
    [ 0xf7, 0x77, 0x37, 0xff ],
    [ 0xfc, 0xaf, 0x45, 0xff ],
    [ 0xff, 0xdc, 0x80, 0xff ],
];

/* this will hold the wasm instance, once it is initialized */
let wasm;
/* current zoom level */
let zoom = 0.8


/**
 * Returns a RGBA color for 
 * @param {number} value from 0.0 to 1.0 
 * @returns Array of 4 values
 */
function gimmeColorforValue(value) {
    /* easy cases */
    if (value <= 0.0) return PALETTE[0];
    if (value >= 1.0) return PALETTE[PALETTE.length - 1];
    /* get the index of the color for this value */
    const div = value / (1.0 / (PALETTE.length - 1));
    const idx = Math.floor(div), t = div % 1.0;


    /* return the linear interpolation between PALETTE 
     * entries */
    return [
        PALETTE[idx][0] * (1 - t) + PALETTE[idx + 1][0] * t,
        PALETTE[idx][1] * (1 - t) + PALETTE[idx + 1][1] * t,
        PALETTE[idx][2] * (1 - t) + PALETTE[idx + 1][2] * t,
        PALETTE[idx][3] * (1 - t) + PALETTE[idx + 1][3] * t,
    ]
}

/**
 * Draws a given section of mandelbrot set into the image data
 * 
 * @param {ImageData} imageData image data to draw to
 * @param {number} s_re start (bottom-left) value of the complex plane, real part
 * @param {number} s_im start (bottom-left) value of the complex plane, imag part
 * @param {number} e_re end (top-right) value of the complex plane, real part
 * @param {number} e_im end (top-right) value of the complex plane, imag part
 */
function drawMandelbrotJS(imageData, s_re, s_im, e_re, e_im) {
    /* width and height of the canvas */
    const w = imageData.width, h = imageData.height;
    /* pixel buffer */
    const pixels = imageData.data;

    /* iterate over pixels - keep in mind that y values grow downwards as 
     * opposed to cartesian coordinates */
    for (let y = 0; y < h; y++) {
        /* compute the imaginary part of coordinate of the point that we try 
         * to draw */
        let c_im = s_im + (e_im - s_im) * (h - y - 1) / h;
        /* x coordinate grows the same way as the cartesian coordinates */
        for (let x = 0; x < w; x++) {
            /* here we assume that the equation is z_next = z^2 + p */
            /* get the coordinate of the pixel on a complex plane */
            let c_re = s_re + (e_re - s_re) * x / w;

            /* initial conditions are z = 0 + 0i */
            var z_re = 0, z_im = 0, iter = 0;

            /* check if applying the formula causes the z to go to inf */
            for (iter = 0; iter < 255; iter++) {
                /* square the zee and add the pee */
                var znext_re = z_re * z_re - z_im * z_im + c_re;
                var znext_im = z_re * z_im + z_im * z_re + c_im;
                /* store the values */
                z_re = znext_re;
                z_im = znext_im;
                /* if mag(z_next) > 2 then we can stop iterating as the 
                 * following iterations will inevidebly explode towards 
                 * infinity */
                if (z_re * z_re + z_im * z_im > 4.0)
                    break;
            }
            
            /* get the corresponding color */
            const color = gimmeColorforValue(1.0 - iter / 255)
            /* set the pixel color */
            pixels[(y * w + x) * 4 + 0] = color[0];
            pixels[(y * w + x) * 4 + 1] = color[1];
            pixels[(y * w + x) * 4 + 2] = color[2];
            pixels[(y * w + x) * 4 + 3] = color[3];
        }
    }
}

/**
 * Draws a given section of mandelbrot set into the image data using WASM
 * 
 * @param {ImageData} imageData image data to draw to
 * @param {number} s_re start (bottom-left) value of the complex plane, real part
 * @param {number} s_im start (bottom-left) value of the complex plane, imag part
 * @param {number} e_re end (top-right) value of the complex plane, real part
 * @param {number} e_im end (top-right) value of the complex plane, imag part
 */
function drawMandelbrotWASM(imageData, s_re, s_im, e_re, e_im)
{
    /* width and height of the canvas */
    const w = imageData.width, h = imageData.height;
    /* pixel buffer */
    const pixels = imageData.data;

    /* render the mandelbrot into the wasms internal buffer */
    const bufPtr = wasm.exports.mandelbrot(w, h, s_re, s_im, e_re, e_im);
    /* handle errors */
    if (bufPtr == 0)
        throw new Error('Unable to render mandelbrot using WASM');
    /* let's prepare the  array object based on the pointer being returned by 
     * the mandelbrot function */
    const cArray = new Uint8Array(wasm.exports.memory.buffer,
        bufPtr, w * h);

    /* convert the generated data to image data */
    for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
            /* get the value from the wasm array */ 
            let val = cArray[y * w + x];
            
            /* get the corresponding color */
            const color = gimmeColorforValue(1.0 - val / 255)
            /* apply the color to the pixel */
            pixels[(y * w + x) * 4 + 0] = color[0];
            pixels[(y * w + x) * 4 + 1] = color[1];
            pixels[(y * w + x) * 4 + 2] = color[2];
            pixels[(y * w + x) * 4 + 3] = color[3];
        }
    }
}

/* display initialization function */
async function init() 
{
    /* display center point and zoom level */
    var c_re = -0.5, c_im = 0.0, zoom = 0.8;

    /* initialize web assembly module that we've compiled from c */
    const { instance } = await WebAssembly.instantiateStreaming(
        /* we need to fool the browser into not caching the wasm as we 
         * work on it. to do that we just add some random/changing trash 
         * after '?' */
        fetch("./mandelbrot.wasm?" + Date.now())
    );

    /* store the reference */
    wasm = instance;

    /* determine the mode of operation */
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.has('wasm') ? 'wasm' : 'js'; 
    console.log('Mode of operation: ' + mode);

    /* get the  reference to the html element */
    const $canvas = document.getElementById('canvas');
    /* get the 2d context that holds the pixel buffer for the canvas */
    const context = $canvas.getContext('2d');
    /* whopsey! */
    if (!context)
        throw new Error('Unable to obtain 2D context for the canvas')


    /* compute the coordinates of the complex plane to be rendered based on the 
     * zoom levels */
    const computePlane = (c_re, c_im, zoom) => {
        /* canvas aspect ratio */
        const c_ar = $canvas.clientWidth / $canvas.clientHeight;
        /* compute aspect ratio factors that are adjusted to the shape of the 
         * canvas */
        const re_af = (c_ar > ASPECT_RATIO) ? c_ar : ASPECT_RATIO;
        const im_af = (c_ar < ASPECT_RATIO) ? ASPECT_RATIO / c_ar : 1;

        /* compute and return the coordinates of the plane */
        return {
            s_re: c_re - zoom * re_af,
            s_im: c_im - zoom * im_af,
            e_re: c_re + zoom * re_af,
            e_im: c_im + zoom * im_af,
        }
    }

    /* function that will cause the area to be redrawn */
    const redraw = () => {
        /* ensure that canvas buffer is the same size as the canvas size */
        $canvas.width = $canvas.clientWidth;
        $canvas.height = $canvas.clientHeight;
        /* get the image data  */ 
        const id = context.getImageData(0, 0, $canvas.width, $canvas.height);
        /* compute the plane coordinates  */
        const { s_re, s_im, e_re, e_im } = computePlane(c_re, c_im, zoom);

        /* drawing start time  */
        const start = Date.now();
        /* render the set into the image data in wasm mode */
        if (mode == 'wasm') {
            drawMandelbrotWASM(id, s_re, s_im, e_re, e_im);
        /* .. or in js mode */
        } else {
            drawMandelbrotJS(id, s_re, s_im, e_re, e_im);
        }
        /* log total drawing time */
        console.log(Date.now() - start);

        /* draw the rendered pixels */
        context.putImageData(id, 0, 0);
    }


    /* create an resize observer that will call the callback when canvas 
     * changes it's size */
    const resizeObserver = new ResizeObserver(redraw);
    /* attach the resize observer to the canvas */
    resizeObserver.observe($canvas);


    /* add mouse wheel event */
    $canvas.addEventListener('wheel', (event) => {
        /* get the coordinates where the wheel scroll happened */
        const x = event.x, y = event.y;
        /* get the scaling factor based on the scroll direction */
        const sf = event.deltaY > 0 ? ZOOM_FACTOR : 1.0 / ZOOM_FACTOR;

        /* get plane coordinates */
        const {s_re, s_im, e_re, e_im} = computePlane(c_re, c_im, zoom)
        /* get the currently displayed plane size */
        var size_re = e_re - s_re, size_im = e_im - s_im;
        /* get the coordinates of the new center point (remember that 'y' works 
         * in reverse) */
        c_re = s_re + (size_re * x / $canvas.width);
        c_im = e_im - (size_im * y / $canvas.height);

        /* a little bit of clamping so that we don't do anything insane */
        c_re = Math.max(Math.min(1.0, c_re), -2.0)
        c_im = Math.max(Math.min(1.0, c_im), -1.0)
        /* update the zoom */
        zoom = Math.min(0.8, zoom * sf);

        /* redraw! */
        redraw();
        /* prevent normal mouse wheel action */
        return false;
    });
}

/* initialize the logig as soon as the document is loaded */
window.addEventListener("load", () => init());