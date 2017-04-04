/*
 * Copyright (c) Maximilian Antoni <max@javascript.studio>
 *
 * @license MIT
 */
'use strict';

const Transform = require('stream').Transform;
const chalk = require('chalk');
const topics = require('../lib/topics');
const value_format = require('../lib/value-format');

const non_printable_ecapes = {
  0: '\\0',
  7: '\\a',
  8: '\\b',
  9: '\\t',
  10: '\\n',
  11: '\\v',
  12: '\\f',
  13: '\\r',
  27: '\\e'
};

function escapeNonPrintable(m) {
  const code = m.charCodeAt(0);
  const escape = non_printable_ecapes[code];
  if (escape) {
    return escape;
  }
  const hex = code.toString(16);
  return hex.length === 1
    ? `\\x0${hex}`
    : `\\x${hex}`;
}

function stringify(value) {
  if (value === null || value === undefined) {
    return chalk.bold(String(value));
  }
  const type = typeof value;
  if (type === 'string') {
    // https://en.wikipedia.org/wiki/ASCII#ASCII_printable_characters
    const escaped = value
      .replace(/'/g, '\\\'')
      .replace(/[^\x20-\x7e]/g, escapeNonPrintable);
    return chalk.green(`'${escaped}'`);
  }
  if (type === 'number' || type === 'boolean') {
    return chalk.yellow(value);
  }
  if (value instanceof Date) {
    return stringify(value.toLocaleString());
  }
  if (Array.isArray(value)) {
    const values = value.map(stringify).join(chalk.magenta(', '));
    return `${chalk.magenta('[')}${values}${chalk.magenta(']')}`;
  }
  const values = Object.keys(value).map((k) => {
    const v = stringify(value[k]);
    return `${k}${chalk.magenta(':')} ${v}`;
  }).join(chalk.magenta(', '));
  if (values) {
    return `${chalk.magenta('{')} ${values} ${chalk.magenta('}')}`;
  }
  return chalk.magenta('{}');
}

function formatStack(style, stack) {
  const p1 = stack.indexOf('\n');
  const first_line = p1 === -1 ? stack : stack.substring(0, p1);
  const formatted = chalk.bgRed.white.bold(first_line);
  if (style === 'message' || p1 === -1) {
    return formatted;
  }
  if (style === 'peek') {
    const p2 = stack.indexOf('\n', p1 + 1);
    const peek = p2 === -1
      ? stack.substring(p1 + 1)
      : stack.substring(p1 + 1, p2);
    return `${formatted} ${chalk.gray(peek.trim())}`;
  }
  const remainder = chalk.gray(stack.substring(p1 + 1));
  return `${formatted}\n${remainder}`;
}

module.exports = function (opts) {
  opts = opts || {};
  const ts = opts.ts !== false;
  const topic = opts.topic !== false;
  const ns = opts.ns !== false;
  const data = opts.data !== false;
  const stack = opts.hasOwnProperty('stack') ? opts.stack : 'peek';
  return new Transform({
    writableObjectMode: true,

    transform(entry, enc, callback) {
      const parts = [];
      if (ts) {
        const date_time = new Date(entry.ts).toLocaleString();
        const time = date_time.substring(date_time.indexOf(' ') + 1);
        parts.push(chalk.gray(time));
      }
      if (topic) {
        parts.push(topics[entry.topic]);
      }
      if (ns) {
        parts.push(chalk.blue(entry.ns));
      }
      if (entry.msg) {
        parts.push(entry.msg);
      }
      if (data && entry.data) {
        if (typeof entry.data === 'object') {
          for (const key in entry.data) {
            if (entry.data.hasOwnProperty(key)) {
              const value = entry.data[key];
              const kvu = value_format(key, value, stringify);
              const k = kvu[0];
              const v = kvu[1];
              const unit = kvu[2];
              const highlighted = unit ? `${chalk.yellow(v)}${unit}` : v;
              parts.push(k ? `${chalk.bold(k)}=${highlighted}` : highlighted);
            }
          }
        } else {
          parts.push(stringify(entry.data));
        }
      }
      if (stack && entry.stack) {
        parts.push(formatStack(stack, entry.stack));
      }
      const str = parts.join(' ');
      callback(null, `${str}\n`);
    }

  });
};
