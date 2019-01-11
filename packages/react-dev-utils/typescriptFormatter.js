/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

'use strict';

const os = require('os');
const codeFrame = require('@babel/code-frame').codeFrameColumns;
const chalk = require('chalk');
const fs = require('fs');

function formatter(message, useColors) {
  const colors = new chalk.constructor({ enabled: useColors });
  const messageColor = message.isWarningSeverity()
    ? colors.yellow
    : colors.red;

  const getFromMessage = (target) => {
    const methodName = target.charAt(0).toUpperCase() + target.slice(1);

    if (typeof message[methodName] === 'function') {
      return message[methodName]();
    }

    return message[target];
  }

  const source =
    getFromMessage('file') &&
    fs.existsSync(getFromMessage('file')) &&
    fs.readFileSync(getFromMessage('file'), 'utf-8');
  let frame = '';

  if (source) {
    frame = codeFrame(
      source,
      { start: { line: message.line, column: message.character } },
      { highlightCode: useColors }
    )
      .split('\n')
      .map(str => '  ' + str)
      .join(os.EOL);
  }

  const tsErrorCode = messageColor.underline(`TS${message.code}`);
  const tsEventType = getFromMessage('severity').toUpperCase();

  return [
    messageColor.bold(`${tsEventType} (${tsErrorCode}): `) +
    messageColor(getFromMessage('content')) +
    '',
    chalk.gray(
      `in ${getFromMessage('file')}(${getFromMessage(
        'line',
        message
      )},${getFromMessage('character')}))`
    ),
    '',
    frame,
  ].join(os.EOL);
}

module.exports = formatter;
