FROM ubuntu:latest
# install all components
RUN apt update && apt upgrade -y
RUN apt install -y llvm lld clang wabt make cpio