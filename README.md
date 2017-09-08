# Jasmine Typescript Console Reporter

[![npm](https://img.shields.io/npm/v/jasmine-ts-console-reporter.svg)](https://www.npmjs.com/package/jasmine-ts-console-reporter)
[![issues](https://img.shields.io/github/issues/SeanSobey/JasmineTSConsoleReporter.svg)](https://github.com/SeanSobey/JasmineTSConsoleReporter/issues)
[![license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/SeanSobey/JasmineTSConsoleReporter/blob/master/LICENSE)

A [Jasmine](https://jasmine.github.io/) Console Reporter that remaps Typescript files. This will use source maps to remap the error stack file paths and line numbers to the source typescript files.

## Preview

![preview](./images/preview.png)

## Installation

`npm i jasmine-ts-console-reporter`

## Usage

Create a helper file for jasmine, eg specs/helpers.js

```js
const TSConsoleReporter = require('jasmine-ts-console-reporter');

jasmine.getEnv().clearReporters(); // Clear default console reporter
jasmine.getEnv().addReporter(new TSConsoleReporter());
```

Load the helper file in Jasmine, eg on node jasmine.json:

```json
{
	"helpers": [
		"specs/helpers.js",
	]
}
```