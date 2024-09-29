# c-wasm-mandelbrot

Simple demonstration of WebAssembly working toghether with JS to produce
neat images of Mandelbrot Set fractal.

The fractal can be drawm in two modes: pure JS and WebAssembly (WASM). JS is 
enabled by default, to switch to WASM add `?wasm` at the end of the url.


## How to build

Wasm code is built from c code using clang/llvm. If you don't have clang and 
you don't want to contaminate your userspace with stuff needed to build the wasm
file then please use the docker image from the Dockerfile present in this repo.

Builing the Docker image:

```
docker image build -t wasm-c .
```

Using the Docker image to build the project:
```
docker run -v .:/c-wasm-mandelbrot -w /c-wasm-mandelbrot wasm-c make all
```

For VSCode users I've also provided the `.vscode` folder where I specified 
tasks for conveniently building using CTRL+SHIFT+B menu. First you run "Start Docker" and then run "Build" each time you want to rebuild things. There is also task for "Cleaning" the build products.


## How to use

Serve the project directory using any http server. For simple projects like this one I often use python's build-in http server:

```
python3 -m http.server 6969
```

This can also be started by simply typing `make serve` which will start the
server on port `6969`.

