# Dockerfile
FROM ubuntu
MAINTAINER Meedan

# Constants
ENV NVM_VERSION v0.29.0
ENV NODE_VERSION v4.3.2
ENV DISPLAY :99
ENV LD_LIBRARY_PATH /usr/lib/x86_64-linux-gnu/

# Replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# Install dependencies
# Utilities: vim git man python-setuptools lsof unzip wget
# Needed to generate the icons: inkscape imagemagick
# Needed for the automated tests: ruby ruby-dev libnss3 libnss3-dev google-chrome-stable xvfb libexif-dev libnss3-1d x11vnc
# Needed to build NVM and run NPM: npm nodejs curl build-essential libssl-dev
RUN apt-get update
RUN apt-get -y upgrade
RUN DEBIAN_FRONTEND=noninteractive apt-get install wget vim git man python-setuptools lsof unzip inkscape imagemagick ruby ruby-dev libnss3 libnss3-dev xvfb libnss3-1d x11vnc libexif-dev npm nodejs curl build-essential libssl-dev -y
RUN wget --no-check-certificate -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo deb http://dl.google.com/linux/chrome/deb/ stable main >> /etc/apt/sources.list.d/google-chrome.list
RUN apt-get update
RUN DEBIAN_FRONTEND=noninteractive apt-get install google-chrome-stable -y
RUN easy_install supervisor
RUN ln -s /usr/bin/nodejs /usr/bin/node

# Configurations
ADD ./docker/supervisord.conf /etc/supervisord.conf
ADD ./docker/start /start

# Install app
ADD . /app
RUN cd app && ./docker/install.sh 

WORKDIR /app

# Web app
EXPOSE 3333
# chromedriver
EXPOSE 9515
# Ngrok
EXPOSE 4040
# VNC
EXPOSE 5999
