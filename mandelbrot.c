#include <stdint.h>


#define MAX_WIDTH 4096
#define MAX_HEIGHT 4096

/* buffer to which we render the results */
uint8_t buf[MAX_WIDTH * MAX_HEIGHT];

/* draw the mandelbrot set within the buffer */
void * mandelbrot(int w, int h, double s_re, double s_im, double e_re, double e_im)
{
    /* sanity check  */
    if (w * h > MAX_WIDTH * MAX_HEIGHT)
        return 0;

    /* iterate over pixels - keep in mind that y values grow downwards as 
     * opposed to cartesian coordinates */
    for (int y = 0; y < h; y++) {
        /* compute the imaginary part of coordinate of the point that we try 
         * to draw */
        double p_im = s_im + (e_im - s_im) * (h - y - 1) / h;
        /* x coordinate grows the same way as the cartesian coordinates */
        for (int x = 0; x < w; x++) {
            /* here we assume that the equation is z_next = z^2 + p */
            /* get the coordinate of the pixel on a complex plane */
            double p_re = s_re + (e_re - s_re) * x / w;

            /* initial conditions are z = 0 + 0i */
            double z_re = 0, z_im = 0; int iter = 0;

            /* check if applying the formula causes the z to go to inf */
            for (iter = 0; iter < 255; iter++) {
                /* square the zee and add the pee */
                double znext_re = z_re * z_re - z_im * z_im + p_re;
                double znext_im = z_re * z_im + z_im * z_re + p_im;
                /* store the values */
                z_re = znext_re;
                z_im = znext_im;
                /* if mag(z_next) > 2 then we can stop iterating as the 
                 * following iterations will inevidebly explode towards 
                 * infinity */
                if (z_re * z_re + z_im * z_im > 4.0)
                    break;
            }
            
            /* set the pixel color */
            buf[y * w + x] = iter;
        }
    }

    /* everything went ok, return the pointer to the buffer */
    return buf;
}