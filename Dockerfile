# Stage 0: install base dependencies
# using 22.13.0 because that is what I got with "node --version" instead of 22.12.0
# this image installs all dependencies. not just prod dependencies
FROM node:22.13.0@sha256:fa54405993eaa6bab6b6e460f5f3e945a2e2f07942ba31c0e297a7d9c2041f62 AS dependencies


LABEL maintainer="Fawad Arshad <farshad2@myseneca.ca>" \
      description="Fragments node.js microservice"


# The code BELOW results in one layer
# using single layer to make it more efficient. No need to create a new layer for each env
ENV PORT=8080 \
    NODE_ENV=production \
    NPM_CONFIG_COLOR=false \
    NPM_CONFIG_LOGLEVEL=warn     
    

# This code BELOW results in mutiple layers
# ENV PORT=8080
# # https://docs.npmjs.com/cli/v8/using-npm/config#loglevel
# ENV NPM_CONFIG_LOGLEVEL=warn
# # https://docs.npmjs.com/cli/v8/using-npm/config#color
# ENV NPM_CONFIG_COLOR=false

# running in production
# ENV NODE_ENV=production

# Use /app as our working directory
WORKDIR /app

# Copy the package.json and package-lock.json files into the working dir
COPY package.json package-lock.json ./

# only installs dependencies and not development dependencies
RUN npm ci --only=production
######################## Stage 0 END ########################
# Stage 1: 
# as runtime because we dont need a build stage
FROM node:22.13.0-alpine@sha256:f2dc6eea95f787e25f173ba9904c9d0647ab2506178c7b5b7c5a3d02bc4af145 AS runtime

WORKDIR /app

# copy dependencies like node_modules
COPY --from=dependencies /app /app

# Copy source code from build context to /app/src/
COPY ./src ./src

# Copy our HTPASSWD file
COPY ./tests/.htpasswd ./tests/.htpasswd

# Start the container by running our server
CMD ["npm", "start"]

# We run our service on port 8080
EXPOSE 8080
######################## Stage 1 END ########################
