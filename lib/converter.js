const fs = require('fs');
const path = require('path');

/**
 * Normalize line endings to \n
 * @param {string} content
 * @returns {string}
 */
function normalizeLineEndings(content) {
	return content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Restore original line endings based on OS
 * @param {string} content
 * @param {string} originalLineEnding
 * @returns {string}
 */
function restoreLineEndings(content, originalLineEnding) {
	if (originalLineEnding === '\r\n') {
		return content.replace(/\n/g, '\r\n');
	} else if (originalLineEnding === '\r') {
		return content.replace(/\n/g, '\r');
	}
	return content;
}

/**
 * Convert single-line comments to multi-line comments in JavaScript code.
 * @param {string} code
 * @returns {string}
 */
function convertComments(code) {
	let result = '';
	let i = 0;
	const length = code.length;
	let state = 'NORMAL';
	let buffer = '';
	let stateStringQuote = '';

	while (i < length) {
		const char = code[i];
		const nextChar = code[i + 1];

		switch (state) {
			case 'NORMAL':
				if (char === '/' && nextChar === '/') {
					state = 'SINGLE_LINE_COMMENT';
					buffer += '/*';
					i += 2;
				} else if (char === "'" || char === '"' || char === '`') {
					state = 'STRING';
					stateStringQuote = char; // Store the type of quote
					buffer += char;
					i += 1;
				} else if (char === '/') {
					// Possible start of regex or division
					buffer += char;
					i += 1;
				} else {
					buffer += char;
					i += 1;
				}
				break;

			case 'STRING':
				if (char === '\\') {
					// Handle escape sequences
					buffer += char + (code[i + 1] || '');
					i += 2;
				} else if (char === stateStringQuote) {
					// Close the string
					buffer += char;
					state = 'NORMAL';
					i += 1;
				} else {
					buffer += char;
					i += 1;
				}
				break;

			case 'SINGLE_LINE_COMMENT':
				if (char === '\n') {
					buffer += ' */\n';
					result += buffer;
					buffer = '';
					state = 'NORMAL';
					i += 1;
				} else {
					buffer += char;
					i += 1;
				}
				break;

			default:
				buffer += char;
				i += 1;
				break;
		}

		// Handle end of file in SINGLE_LINE_COMMENT state
		if (i >= length && state === 'SINGLE_LINE_COMMENT') {
			buffer += ' */';
			result += buffer;
			buffer = '';
			state = 'NORMAL';
		}
	}

	result += buffer;
	return result;
}

/**
 * Process a single file: read, convert comments, and write back.
 * @param {string} filePath
 */
function processFile(filePath) {
	const absolutePath = path.resolve(filePath);
	fs.readFile(absolutePath, 'utf8', (err, data) => {
		if (err) {
			console.error(`Error reading file "${filePath}":`, err.message);
			return;
		}

		// Detect original line ending
		const lineEndingMatch = data.match(/\r\n|\r|\n/);
		const originalLineEnding = lineEndingMatch ? lineEndingMatch[0] : '\n';

		// Normalize line endings
		const normalizedData = normalizeLineEndings(data);

		// Convert comments
		const convertedData = convertComments(normalizedData);

		// Restore original line endings
		const finalData = restoreLineEndings(convertedData, originalLineEnding);

		fs.writeFile(absolutePath, finalData, 'utf8', (writeErr) => {
			if (writeErr) {
				console.error(`Error writing file "${filePath}":`, writeErr.message);
				return;
			}
			console.log(`Converted comments in "${filePath}" successfully.`);
		});
	});
}

module.exports = {
	convertComments,
	processFile,
};
