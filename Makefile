BIN = ./node_modules/.bin
TESTS = $(shell ls -S `find test -type f -name "*.test.js" -print`)
REPORTER = spec
TIMEOUT = 30000
MOCHA_OPTS =

install:
	@npm install

test: install
	@NODE_ENV=test $(BIN)/mocha \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--require should \
		$(MOCHA_OPTS) \
		$(TESTS)

test-cov:
	@$(MAKE) test \
		MOCHA_OPTS='--require blanket' \
		REPORTER=travis-cov

test-cov-html:
	@rm -f coverage.html
	@$(MAKE) test \
		MOCHA_OPTS='--require blanket' \
		REPORTER=html-cov \
	> coverage.html
	@ls -lh coverage.html
	@open coverage.html

test-coveralls:
	@$(MAKE) test \
		REPORTER=tap
	@echo TRAVIS_JOB_ID $(TRAVIS_JOB_ID)
	@-$(MAKE) test \
		MOCHA_OPTS='--require blanket' \
		REPORTER=mocha-lcov-reporter \
	| $(BIN)/coveralls

test-all: test test-cov

authors: install
	@$(BIN)/contributors -f plain -o AUTHORS

clean:
	rm -rf node_modules

.PHONY: test
