#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { processFile } = require('../lib/converter');

/**
 * Display usage instructions.
 */
function displayUsage() {
	const usage = `
Usage: js-comment-converter [options] <file ...>

Options:
  -h, --help      Display this help message
  -v, --version   Display the version number

Description:
  Converts single-line JavaScript comments (//) to multi-line comments (/* */).
  Processes the specified file(s) in place.

Examples:
  js-comment-converter script.js
  js-comment-converter src/*.js
	`;
	console.log(usage);
}

/**
 * Display version.
 */
function displayVersion() {
	const pkg = require('../package.json');
	console.log(`js-comment-converter version ${pkg.version}`);
}

/**
 * Parse command-line arguments.
 * @returns {object}
 */
function parseArguments() {
	const args = process.argv.slice(2);
	const options = {
		files: [],
	};

	args.forEach((arg) => {
		if (arg === '-h' || arg === '--help') {
			options.help = true;
		} else if (arg === '-v' || arg === '--version') {
			options.version = true;
		} else {
			options.files.push(arg);
		}
	});

	return options;
}

/**
 * Main function.
 */
function main() {
	const options = parseArguments();

	if (options.help) {
		displayUsage();
		process.exit(0);
	}

	if (options.version) {
		displayVersion();
		process.exit(0);
	}

	if (options.files.length === 0) {
		console.error('Error: No input files specified.');
		displayUsage();
		process.exit(1);
	}

	// Process each file
	options.files.forEach((filePattern) => {
		const resolvedPath = path.resolve(filePattern);
		fs.stat(resolvedPath, (err, stats) => {
			if (err) {
				console.error(`Error accessing file "${filePattern}":`, err.message);
				return;
			}

			if (stats.isFile()) {
				processFile(resolvedPath);
			} else {
				console.error(`Skipping "${filePattern}": Not a file.`);
			}
		});
	});
}

main();
