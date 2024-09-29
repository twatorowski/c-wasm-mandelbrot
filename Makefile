# flags used for compilation and linking
CFLAGS = --target=wasm32 -O3 -flto -nostdlib -Wl,--no-entry
LDFLAGS = -Wl,--export-all -Wl,--lto-O3

# compile the addition logic
all: mandelbrot.wat mandelbrot.wasm
	
# compile
mandelbrot.wasm: mandelbrot.c
	clang $(CFLAGS) $(LDFLAGS) -o mandelbrot.wasm mandelbrot.c

# convert to hooman readable wat
mandelbrot.wat: mandelbrot.wasm
	wasm2wat mandelbrot.wasm > mandelbrot.wat

# remove the files that were build
clean:
	rm mandelbrot.wasm mandelbrot.wat

# start the http server on port 6969
serve:
	python3 -m http.server 6969