# Studio Log

👻 Log [ndjson][1] to an output stream, format the output with emoji ✨

![](https://github.com/javascript-studio/studio-log/raw/master/emojilog.png)

## Features

- Fancy formats with emoji for log file reading pleasure.
- API designed to produce expressive source code.
- Uses topics instead of log levels for more fine grained filtering.
- Uses object streams to avoid serialize -> parse -> serialize when used in a
  command line application.
- Disabled by default. If no output stream is specified, no logs are written.

## Usage

Log output is disabled by default to ensure logs don't get in the way when
writing unit tests. Therefore you want to set this up as the first thing in
your main:

```js
// Sending raw JSON logs to stdout, e.g. in a server application:
require('@studio/log').out(process.stdout);

// Sending fancy formatted logs to stdout, e.g. in a command line tool:
require('@studio/log')
  .transform(require('@studio/log/format/fancy')())
  .out(process.stdout);
```

Next, create a logger instance in a module and start writing logs:

```js
const logger = require('@studio/log');

const log = logger('app');

exports.startService = function (port) {
  log.launch('my service', { port: 433 });
};

```

In the server example above, this output is produced:

```json
{"ts":1486630378584,"ns":"app","topic":"launch","msg":"my service","data":{"port":433}}
```

Send your logs to the `emojilog` command for pretty printing:

```bash
$ cat logs.ndjson | emojilog
09:52:58 🚀  app my service port=433
```

## Install

```bash
$ npm install @studio/log --save
```

Install this module globally to get the `emojilog` command line tool to format
logs:

```bash
$ npm install @studio/log -g
# ...
$ node app.js | emojilog
```

## Topics

Instead of log levels, this logger uses a set of topics to categorize, format
and filter logs. Unlike log levels, topics are not ordered by severity.

These topics are available:

- ✅ = `ok`
- ⚠️ = `warn`
- 🐛 = `issue`
- 🚨 = `error`
- 🙈 = `ignore`
- 🔺 = `input`
- 🔻 = `output`
- 📤 = `send`
- 📥 = `receive`
- 📡 = `fetch`
- 🏁 = `finish`
- 🚀 = `launch`
- ⛔️ = `terminate`
- ✨ = `spawn`
- 📣 = `broadcast`
- 💾 = `disk`
- ⏱  = `timing`
- 💰 = `money`
- 🔢 = `numbers`
- 👻 = `wtf`

## Log format

- `ns`: The logger instance namespace.
- `ts`: The timestamp as returned by `Date.now()`.
- `topic`: The topic name.
- `msg`: The message.
- `data`: The data.
- `stack`: The stack of error object.
- `cause`: The cause stack of `error.cause` object, if available.

## API

### Creating a logger

- `log = logger(ns[, data])`: Creates a new logger with the given namespace.
  The namespace is added to each log entry as the `ns` property. If `data` is
  provided, it is added to each log entry. Multiple calls with the same `ns`
  property return the same logger instance while data is replaced.
- `log.child(ns[, data])`: Creates a child logger of a log instance. The
  namespaces are joined with a blank and `data` is merged. Multiple calls with
  the same `ns` property return the same logger instance while data is
  replaced.

### Log instance functions

- `log.{topic}([message][, data][, error])`: Create a new log entry with these
  behaviors:
    - The `topic` is added as the `"topic"`.
    - If `message` is present, it's added as the `"msd"`.
    - If `data` is present, it's added as the `"data"`.
    - If `error` is present, the `stack` property of the error is added as the
      `"stack"`. If no `stack` is present, the `toString` representation of the
      error is used.
    - If `error.code` is present, it is added to the `"data"` without modifying
      the original object.
    - If `error.cause` is present, the `stack` property of the cause is added
      as the `"cause"`. If no `stack` is present, the `toString` representation
      of the cause is used.
    - If `error.cause.code` is present, a `cause` object is added to the
      `"data"` with `{ code: cause.code }` and without modifying the original
      object.
- `log.filter([ns, ]stream)`: Configure a filter stream for this logger or a
  child logger namespace. See ["Filter Streams"](#filter-streams).
- `log.mute()`: Mute this logger namespace.

### Global functions

- `logger.filter([namespace, ]stream)`: Configures a filter stream for the
  given namespace, or a global filter stream. See ["Filter
  Streams"](#filter-streams).
- `logger.mute(namespace[, topic])`: Mute the given namespace or only the topic
  in the namespace, if given.
- `logger.muteAll(topic)`: Mute the given topic in all namespaces.
- `logger.out(stream)`: Configure the output stream to write logs to. If not
  specified, no logs are written.
- `logger.transform(stream)`: Configure a transform stream to format logs. The
  given stream must be in `readableObjectMode`. See ["Format
  Transforms"](#format-transforms).
  further down. Defaults to [@studio/ndjson/stringify][4].
- `logger.hasStream()`: Whether an output stream was set.
- `logger.reset()`: Resets everything to the defaults.

## CLI Options

- `--format` or `-f` set the formatter to use. Defaults to "fancy".
- `--no-ts` hide timestamps
- `--no-topic` hide topics
- `--no-ns` hide namespaces
- `--no-data` hide data
- `--no-stack` hide stacks
- `--stack message` only show the error message
- `--stack peek` show the message and the first line of the trace (default)
- `--stack full` show the message and the full trace
- `--stack` same as `--stack full`
- `--map` use given source maps file to map stack traces

## Filter Streams

Filter streams can be used to alter the data before passing it to the transform
stream. Filter streams must be in `objectMode`. For example, [Studio Log X][5]
is a filter stream implementation.

## Format Transforms

Install a transform stream if you want to use Studio log in a command line
application. The bundled transform streams have to be required separately:

```js
const formatter = require('@studio/log/format/basic');

logger.transform(formatter({ ts: false }));
```

The following transform streams are available:

- `basic`: Basic formatting with ISO dates and no colors
- `fancy`: Colored output with localized dates. This is the default formatter
  when using the `emojilog` CLI.

Some advanced formatting is applied by naming conventions on top level
properties of the `data` object. See [demo.js][2] for some examples.

- `ts` or prefix `ts_` formats a timestamp.
- `ms` or prefix `ms_` formats a millisecond value.
- `bytes` or prefix `bytes_` formats a byte value.

These options can be passed to the bundled format transforms:

- `ts: false` hide timestamps
- `topic: false` hide topics
- `ns: false` hide namespaces
- `data: false` hide data
- `stack: style` with these stack styles:
    - `false`: hide the error entirely
    - `message` only show the error message
    - `peek` show the message and the first line of the trace (default)
    - `full` show the message and the full trace

The `stack` option is also used to format the `"cause"`, if present.

## Custom Format Transforms

Format transforms are [node transform streams][3] in `writableObjectMode`. Here
is an example transform implementation, similar to the [default transform][4]:

```js
const { Transform } = require('stream');

const ndjson = new Transform({
  writableObjectMode: true,

  transform(entry, enc, callback) {
    const str = JSON.stringify(entry);
    callback(null, `${str}\n`);
  }
});
```

## Related modules

- ☯️ [Studio ndjson][4] can be used to parse the ndjson produced by Studio log.
  The `ParseTransform` is internally used by the `emojilog` command and the
  `StringifyTransform` is used as the default transform to serialize to ndjson.
- ❎ [Studio Log X][5] x-out confidential data in log entries.
- 📦 [Studio Changes][6] is used to create the changelog for this module.

## License

MIT

<div align="center">Made with ❤️ on 🌍</div>

[1]: http://ndjson.org/
[2]: https://github.com/javascript-studio/studio-log/blob/master/examples/demo.js
[3]: https://nodejs.org/api/stream.html#stream_implementing_a_transform_stream
[4]: https://github.com/javascript-studio/studio-ndjson
[5]: https://github.com/javascript-studio/studio-log-x
[6]: https://github.com/javascript-studio/studio-changes
