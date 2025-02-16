# This is a Dockerfile for our fragments microservice.

# using 22.13.0 because that is what I got with "node --version" instead of 22.12.0
FROM node:22.13.0


LABEL maintainer="Fawad Arshad <farshad2@myseneca.com>" \
      description="Fragments node.js microservice"


# The code BELOW results in one layer
# ENV PORT=8080 \
#     NPM_CONFIG_LOGLEVEL=warn \
#     NPM_CONFIG_COLOR=false 

# This code BELOW results in mutiple layers
ENV PORT=8080
# https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
ENV NPM_CONFIG_LOGLEVEL=warn
# https://docs.npmjs.com/cli/v8/using-npm/config#color
ENV NPM_CONFIG_COLOR=false


# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the working dir
COPY package.json package-lock.json ./

# Install node dependencies defined in package-lock.json
RUN npm install

# Copy src to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 8080
