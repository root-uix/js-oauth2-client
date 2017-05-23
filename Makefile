PORT ?= 18219
REGRESSION ?= false
NODE_ENV ?= development
NODE_BIN ?= ./node_modules/.bin

SRC=./src
DIST=./dist

JS_INPUT = $(SRC)/index.js
JS_OUTPUT_TMP = $(DIST)/index.tmp.js
JS_OUTPUT = $(DIST)/index.js

clean:
	@echo "Cleaning"
	@rm -rf $(DIST)
	@mkdir -p $(DIST)

lint:
	@echo "Linting 'src'" 
	@$(NODE_BIN)/standard --fix $(SRC)

test: lint test-server-startup test-node test-browser test-server-shutdown

test-server-startup:
	@echo "Starting test server..."
	@PORT=$(PORT) node test/support/server.js & echo $$! > .server.pid

test-server-shutdown:
	@echo "Shutting down test server..."
	@if [ -f .server.pid ]; then kill -9 $$(cat .server.pid); rm .server.pid; fi

test-browser:
	@echo "Running Tests on Browsers"
	@PORT=$(PORT) $(NODE_BIN)/karma start --single-run

test-node:
	@echo "Running NodeJS Tests"
	@PORT=$(PORT) $(NODE_BIN)/mocha -R spec --bail --require test/support/globals.js

build: clean test
	@echo "Finished $@ at `date`"

release: clean test
	@$(MAKE) js-minify
	@$(MAKE) js-polyfill
	@$(MAKE) js-node
	@echo "Finished $@ at `date`"

regression: clean test
	
	@echo "Finished $@ at `date`"

js-node: JS_INPUT=$(SRC)/index.js
js-node: JS_OUTPUT=$(DIST)/node.js
js-node:
	@echo "Noderify..."
	@$(NODE_BIN)/browserify $(JS_INPUT) -o $(JS_OUTPUT_TMP) --node --standalone OAuth2Client 
	@$(NODE_BIN)/derequire $(JS_OUTPUT_TMP) > $(JS_OUTPUT)
	@rm $(JS_OUTPUT_TMP)
	@echo "Noderify::Minifying scripts..."
	@$(NODE_BIN)/uglifyjs $(JS_OUTPUT) \
		--compress \
		--output $(JS_OUTPUT)

js-polyfill: JS_INPUT=$(SRC)/index.polyfilled.js
js-polyfill: JS_OUTPUT=$(DIST)/auto.js
js-polyfill: js-minify

js-browserify:
	@echo "Browserify..."
	@$(NODE_BIN)/browserify $(JS_INPUT) -o $(JS_OUTPUT_TMP) --standalone OAuth2Client
	@$(NODE_BIN)/derequire $(JS_OUTPUT_TMP) > $(JS_OUTPUT)
	@rm $(JS_OUTPUT_TMP)

js-minify: js-browserify
	@echo "$>::Minifying scripts..."
	@$(NODE_BIN)/uglifyjs $(JS_OUTPUT) \
		--compress \
		--output $(JS_OUTPUT)

install:
	@echo "Installing NPM Modules"
	@npm install

.PHONY: install build test-node test-browser test-server-startup test-server-shutdown lint release regression js-polyfill js-browserify js-minify js-node
