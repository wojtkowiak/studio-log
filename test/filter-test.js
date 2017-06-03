/*eslint-env mocha*/
'use strict';

const assert = require('assert');
const sinon = require('sinon');
const Writable = require('stream').Writable;
const Transform = require('stream').Transform;
const logger = require('..');

describe('filter', () => {
  let sandbox;
  let out;
  let log;
  let entries;

  beforeEach(() => {
    out = '';
    entries = [];
    sandbox = sinon.sandbox.create({ useFakeTimers: true });
    sandbox.clock.tick(123);
    log = logger('test');
  });

  afterEach(() => {
    sandbox.restore();
    logger.reset();
  });

  function installOutputStream() {
    logger.out(new Writable({
      write(chunk, enc, done) {
        out += chunk;
        done();
      }
    }));
  }

  function installFilterStream() {
    log.filter(new Transform({
      objectMode: true,
      transform(entry, enc, callback) {
        entries.push(entry);
        this.push(entry);
        callback();
      }
    }));
  }

  it('writes to given filter if output is installed first', () => {
    installOutputStream();
    installFilterStream();

    log.ok('Message');

    assert.equal(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.deepEqual(entries, [{
      ts: 123,
      ns: 'test',
      topic: 'ok',
      msg: 'Message'
    }]);
  });

  it('writes to given filter if output is installed after', () => {
    installFilterStream();
    installOutputStream();

    log.ok('Message');

    assert.equal(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.deepEqual(entries, [{
      ts: 123,
      ns: 'test',
      topic: 'ok',
      msg: 'Message'
    }]);
  });

  it('stops writing to filter after reset I', () => {
    installFilterStream();
    installOutputStream();

    logger.reset();
    installOutputStream();
    log.ok('Message');

    assert.equal(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.deepEqual(entries, []);
  });

  it('stops writing to filter after reset II', () => {
    installFilterStream();
    // No output and therefore no default transform

    logger.reset();
    installOutputStream();
    log.ok('Message');

    assert.equal(out, '{"ts":123,"ns":"test","topic":"ok","msg":"Message"}\n');
    assert.deepEqual(entries, []);
  });

});
