
BIN := node_modules/.bin
REPORTER ?= spec
NODE ?= node
NFLAGS ?= --harmony-generators
SRC = $(wildcard *.js)
TESTS = $(wildcard test/*.js)

test: node_modules clean
	@$(BIN)/mocha \
	  --reporter $(REPORTER) \
	  --require co-mocha \
	  $(NFLAGS)

node_modules: package.json
	@npm install
	@touch $@

coverage: $(SRC) $(TESTS) node_modules
	@$(NODE) $(NFLAGS) $(BIN)/istanbul cover \
	  $(BIN)/_mocha -- \
	    --reporter $(REPORTER) \
	    --require co-mocha \
	    --timeout 5s

clean:
	@rm -rf test/fixtures/*/{build,components} coverage

.PHONY: clean
