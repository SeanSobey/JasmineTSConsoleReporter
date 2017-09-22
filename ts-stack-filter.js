const path = require('path');
const fs = require("fs");

const sourceMap = require('source-map'); //https://github.com/mozilla/source-map#consuming-a-source-map
const sourceMapResolve = require("source-map-resolve"); //https://www.npmjs.com/package/source-map-resolve
const errorStackParser = require('error-stack-parser'); //https://github.com/stacktracejs/error-stack-parser

function create(jasmineCorePath) {

	return function tsStackFilter(stack) {

		if (!stack) {
			return '';
		}
		return errorStackParser.parse({
			stack: stack
		})
			.filter(function (stackFrame) {
				return stackFrame.fileName.indexOf(jasmineCorePath) === -1;
			})
			.map((stackFrame) => {
				//console.log('stackFrame', stackFrame);
				if (!path.isAbsolute(stackFrame.fileName)) {
					return stackFrame.source;
				}
				const code = fs.readFileSync(stackFrame.fileName, 'utf8');
				const srcMapResult = sourceMapResolve.resolveSourceMapSync(code, stackFrame.fileName, fs.readFileSync);
				if (!srcMapResult) {
					return stackFrame.source;
				}
				//console.log('stackFrame', stackFrame);
				//console.log('srcMapResult', Object.assign({}, srcMapResult, { map: 'excluded' })); 
				const srcMapConsumer = new sourceMap.SourceMapConsumer(srcMapResult.map);
				const originalPosition = srcMapConsumer.originalPositionFor({
					line: stackFrame.lineNumber,
					column: stackFrame.columnNumber
				});
				//console.log('originalPosition', originalPosition);
				//const fileName = path.resolve(originalPosition.source, srcMapResult.sourcesRelativeTo);
				if (!originalPosition.source) {
					//console.log('Failed to resolve original position');
					return stackFrame.source;
				}
				const fileName = path.normalize(stackFrame.fileName + '/../' + originalPosition.source); //TODO: handle paths not same as map file
				//console.log('result', fileName + ':' + originalPosition.line + ':' + originalPosition.column);
				return stackFrame.source.replace(
					stackFrame.fileName + ':' + stackFrame.lineNumber + ':' + stackFrame.columnNumber,
					fileName + ':' + originalPosition.line + ':' + originalPosition.column
				);
			}).join('\n');
	}
}

module.exports = exports = {
	create: create
};
