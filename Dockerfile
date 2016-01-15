# This is for x86:
#FROM node:onbuild
# This is for ARM:
FROM hypriot/rpi-node:onbuild

# The ONBUILD instructions of the base image take
# care of copying the code and installing dependencies.

RUN npm run build
