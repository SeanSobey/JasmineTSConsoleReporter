//node_modules\jasmine\lib\reporters\console_reporter.js
//https://jasmine.github.io/2.1/custom_reporter.html
//https://github.com/jasmine/jasmine/blob/v2.5.0/lib/console/console.js
//https://github.com/jbblanchet/jasmine-terminal-reporter

var noopTimer = {
	start: function () {},
	elapsed: function () {
		return 0;
	}
};

function ConsoleReporter() {
	var print = function () {},
		showColors = false,
		timer = noopTimer,
		jasmineCorePath = null,
		printDeprecation = function () {},
		specCount,
		executableSpecCount,
		failureCount,
		failedSpecs = [],
		pendingSpecs = [],
		ansi = {
			green: '\x1B[32m',
			red: '\x1B[31m',
			yellow: '\x1B[33m',
			none: '\x1B[0m'
		},
		failedSuites = [],
		titleFilter = defaultTitleFilter,
		stackFilter = defaultStackFilter,
		messageFilter = defaultMessageFilter,
		onComplete = function () {};

	this.setOptions = function (options) {
		if (options.print) {
			print = options.print;
		}
		showColors = options.showColors || false;
		if (options.timer) {
			timer = options.timer;
		}
		if (options.jasmineCorePath) {
			jasmineCorePath = options.jasmineCorePath;
		}
		if (options.printDeprecation) {
			printDeprecation = options.printDeprecation;
		}
		if (options.titleFilter) {
			titleFilter = options.titleFilter;
		}
		if (options.stackFilter) {
			stackFilter = options.stackFilter;
		}
		if (options.messageFilter) {
			messageFilter = options.messageFilter;
		}
		if (options.onComplete) {
			printDeprecation('Passing in an onComplete function to the ConsoleReporter is deprecated.');
			onComplete = options.onComplete;
		}
	};

	this.jasmineStarted = function (options) {
		specCount = 0;
		executableSpecCount = 0;
		failureCount = 0;
		if (options && options.order && options.order.random) {
			printLine('Randomized with seed ' + options.order.seed);
		}
		printLine('Started');
		timer.start();
	};

	this.jasmineDone = function (result) {
		printNewline(); // line break after last dot
		printNewline(); // empty line

		if (failedSpecs.length > 0) {
			printLine('Failures:');
			printNewline();
			for (var i = 0; i < failedSpecs.length; i++) {
				specFailureDetails(failedSpecs[i], i + 1);
			}
			printNewline();
		}

		if (pendingSpecs.length > 0) {
			printLine("Pending:");
			printNewline();
			for (i = 0; i < pendingSpecs.length; i++) {
				pendingSpecDetails(pendingSpecs[i], i + 1);
			}
			printNewline();
		}

		if (specCount > 0) {
			if (executableSpecCount !== specCount) {
				printLine('Ran ' + executableSpecCount + ' of ' + specCount + plural(' spec', specCount));
			}

			var specCounts = executableSpecCount + ' ' + plural('spec', executableSpecCount) + ', ' +
				failureCount + ' ' + plural('failure', failureCount);
			if (pendingSpecs.length) {
				specCounts += ', ' + pendingSpecs.length + ' pending ' + plural('spec', pendingSpecs.length);
			}
			printLine(specCounts);
		} else {
			printLine('No specs found');
		}

		var seconds = timer.elapsed() / 1000;
		printLine('Finished in ' + seconds + ' ' + plural('second', seconds));

		for (i = 0; i < failedSuites.length; i++) {
			suiteFailureDetails(failedSuites[i]);
		}

		if (result && result.failedExpectations) {
			suiteFailureDetails(result);
		}

		if (result && result.order && result.order.random) {
			printLine('Randomized with seed ' + result.order.seed);
		}

		onComplete(failureCount === 0);
	};

	this.specDone = function (result) {
		specCount++;

		if (result.status == 'pending') {
			pendingSpecs.push(result);
			executableSpecCount++;
			print(colored('yellow', '*'));
			return;
		}

		if (result.status == 'passed') {
			executableSpecCount++;
			print(colored('green', '.'));
			return;
		}

		if (result.status == 'failed') {
			failureCount++;
			failedSpecs.push(result);
			executableSpecCount++;
			print(colored('red', 'F'));
		}
	};

	this.suiteDone = function (result) {
		if (result.failedExpectations && result.failedExpectations.length > 0) {
			failureCount++;
			failedSuites.push(result);
		}
	};

	return this;

	function printNewline() {
		print('\n');
	}

	function printLine(str) {
		print(str);
		print('\n');
	}

	function colored(color, str) {
		return showColors ? (ansi[color] + str + ansi.none) : str;
	}

	function plural(str, count) {
		return count == 1 ? str : str + 's';
	}

	function repeat(thing, times) {
		var arr = [];
		for (var i = 0; i < times; i++) {
			arr.push(thing);
		}
		return arr;
	}

	function indent(str, spaces) {
		var lines = (str || '').split('\n');
		var newArr = [];
		for (var i = 0; i < lines.length; i++) {
			newArr.push(repeat(' ', spaces).join('') + lines[i]);
		}
		return newArr.join('\n');
	}

	function defaultStackFilter(stack) {
		if (!stack) {
			return '';
		}

		var filteredStack = stack.split('\n').filter(function (stackLine) {
			return stackLine.indexOf(jasmineCorePath) === -1;
		}).join('\n');
		return filteredStack;
	}

	function defaultTitleFilter(title) {
		return title;
	}

	function defaultMessageFilter(message) {
		return message;
	}

	function specFailureDetails(result, failedSpecNumber) {
		print(failedSpecNumber + ') ');
		print(titleFilter(result.fullName));

		for (var i = 0; i < result.failedExpectations.length; i++) {
			var failedExpectation = result.failedExpectations[i];
			printNewline();
			print(indent('Message:', 2));
			printNewline();
			print(colored('red', indent(messageFilter(failedExpectation.message), 4)));
			printNewline();
			print(indent('Stack:', 2));
			printNewline();
			print(indent(stackFilter(failedExpectation.stack), 4));
		}

		printNewline();
	}

	function suiteFailureDetails(result) {
		for (var i = 0; i < result.failedExpectations.length; i++) {
			printLine(colored('red', 'An error was thrown in an afterAll'));
			printLine(colored('red', 'AfterAll ' + result.failedExpectations[i].message));
		}
	}

	function pendingSpecDetails(result, pendingSpecNumber) {
		print(pendingSpecNumber + ') ');
		print(result.fullName);
		printNewline();
		var pendingReason = "No reason given";
		if (result.pendingReason && result.pendingReason !== '') {
			pendingReason = result.pendingReason;
		}
		print(indent(colored('yellow', pendingReason), 2));
		printNewline();
	}
}

module.exports = exports = ConsoleReporter;