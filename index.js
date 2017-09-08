const path = require('path');
const util = require('util');

const ConsoleReporter = require('./console-reporter');
const tsStackFilter = require('./ts-stack-filter');

function TSConsoleReporter(options) {

	const consoleReporter = new ConsoleReporter();
	options = options || {};
	const jasmineCorePath = options.jasmineCorePath || path.join(require('jasmine-core').files.path, 'jasmine.js');
	consoleReporter.setOptions({
		timer: options.timer || new jasmine.Timer(),
		print: options.print ||function () {
			process.stdout.write(util.format.apply(this, arguments));
		},
		showColors: options.showColors === undefined ? true : options.showColors,
		jasmineCorePath: jasmineCorePath,
		stackFilter: tsStackFilter.create(jasmineCorePath)
	});

	return consoleReporter;
}

module.exports = exports = TSConsoleReporter;