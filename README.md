# fragments

For DPS955 Lab1

# npm scripts

## start

The "start" script runs our server normally

## dev

"dev" runs it via nodemon, which watches the src/\*\* folder for any changes, restarting the server whenever something is updated

## debug

"debug" is the same as dev but also starts the node inspector on port 9229, so that you can attach a debugger

### env

"dev": "cross-env ...",
"debug": "cross-env ..."
dev and debug starts require cross-env

# eslint.config.mjs

changed { languageOptions: { globals: globals.browser } } to globals: globals.node

# Eslint package.json changes

Added a lint script to package.json file to run ESLint from the command line

# Additional packages

Installed Pino Pretty using "npm install --save pino pino-pretty pino-http"
Allows for Structured Logging

Installed middleware: cors, express, helmet, compression
