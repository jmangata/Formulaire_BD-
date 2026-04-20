# syntax=docker/dockerfile:1

ARG NODE_VERSION=20

#FROM node:${NODE_VERSION}-bookworm
FROM node:20-bookworm

# Set the node environment to production.
ENV NODE_ENV test

# Set timezone environment variable
ENV TZ='America/Martinique'
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
#RUN rm /etc/apt/sources.list.d/debian.sources

# Configuration Mirroir debian.ctmatinik.mq
#COPY sources.list /etc/apt/sources.list
#COPY debian.ctmatinik.mq.crt /usr/local/share/ca-certificates/debian.ctmatinik.mq.crt
#COPY ca-cert.deb ca-cert.deb
#COPY openssl.deb openssl.deb
##COPY libssl3.deb libssl3.deb
#RUN dpkg -i libssl3.deb
#RUN dpkg -i openssl.deb
#RUN dpkg -i ca-cert.deb
#RUN apt-get update
#RUN apt-get install -y ca-certificates
#RUN update-ca-certificates
#RUN apt-get update && apt-get install -y \
#    python3 \
#    python3-pip \
#    make \
#    g++ \
#    gcc \
#    apache2 apache2-utils libapache2-mod-auth-gssapi krb5-user krb5-config supervisor\
#    && apt-get clean \
#    && rm -rf /var/lib/apt/lists/*


#COPY krb5.conf /etc/krb5.conf

# Set Python alias if needed
RUN ln -sf python3 /usr/bin/python

# Set environment variable for Python path
ENV PYTHON=/usr/bin/python

RUN npm install -g node-gyp

# Install PM2 globally
RUN npm install pm2 -g

# Enable mod_auth_gssapi and mod_rewrite
# RUN a2enmod auth_gssapi rewrite proxy proxy_http proxy_balancer headers


# Install app dependencies using npm ci for production
#RUN npm ci


# Expose the port that the application listens on.
# EXPOSE 3000


#WORKDIR /var/www/html

#COPY ./organigramme_ctm/organigramme/ ./

# Set the working directory for the Node.js application
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY ./backend/package*.json ./

RUN npm config set strict-ssl false
# Install Node.js dependencies
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy the rest of the application code
COPY ./backend/ .

# Copy the virtual host configuration
COPY vhost.conf /etc/apache2/sites-available/000-default.conf


# Expose the necessary ports
#EXPOSE 80 3000

# Start Apache and the Node.js application
#CMD apache2ctl -D FOREGROUND && nodemon -L app.js
CMD  pm2-runtime start ecosystem.config.js
