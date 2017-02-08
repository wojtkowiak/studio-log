# Tiny JSON logger with ❤️

Log [ndjson][1] to an output stream with emoji ✨

## Usage

```js
const logger = require('@studio/log');

const log = logger('app');

log.launch('my service', { port: 433 });
```

If you install this module globally (`npm install @studio/log -g`), the
`emojilog` command line tool is made available. Use it to format logs:

```bash
$ node app.js | emojilog
```

## Philosophy

- Work with object streams internally to avoid unnecessary serialization &
  parsing when using in a command line application.
- API designed to produce expressive source code.
- Use topics instead of log levels. This allow more fine grained filtering and
  more expressive display.
- Fancy formats with emoji for log file reading pleasure.

## API

- `log = logger(ns)`: Creates a new logger with the given namespace. The
  namespace is added to each log entry as the `ns` property.
- `log.{topic}(message[, data][, error])`: Create a new log entry with these
  properties:
    - `ns`: The logger instance namespace.
    - `ts`: The timestamp as returned by `Date.now()`.
    - `topic`: The topic name.
    - `msg`: The message.
    - `data`: The data.
    - `stack`: The stack of error object.
- `logger.mute(namespace[, topic])`: Mute the given namespace or only the topic
  in the namespace, if given.
- `logger.muteAll(topic)`: Mute the given topic in all namespaces.
- `logger.out(stream)`: Configure the output stream to write logs to. Defaults
  to `process.stdout`.
- `logger.transform(stream)`: Configure a transform stream to format logs. The
  given stream must be in `objectMode`.
- `logger.basic()`: Returns a transform stream in `objectMode` that applies
  basic formatting and serializes the data object.
- `logger.fancy()`: Returns a transform stream in `objectMode` that formats
  logs for the command line with colors as specified below.
- `logger.reset()`: Resets everything to the defaults.

## Topics

Instead of log levels, this logger uses a set of topics to categorize, format
and filter logs. Unlike log levels, topics are not ordered by severity.

These topics are available:

- `ok`: ✅
- `warn`: ⚠️
- `issue`: 🐛
- `error`: 🚨
- `ignore`: 🙈
- `input`: 🔺
- `output`: 🔻
- `send`: 📤
- `receive`: 📥
- `fetch`: 📡
- `finish`: 🏁
- `launch`: 🚀
- `terminate`: ⛔️
- `spawn`: ✨
- `broadcast`: 📣
- `disk`: 💾
- `timing`: ⏱`
- `money`: 💰
- `numbers`: 🔢
- `wtf`: 👻

## Formatting

These formatting rules are applied by naming conventions:

- `ts` or prefix `ts\_` formats a timestamp as "2017-02-08T07:27:49.774Z".
- `ms` or prefix `ms\_` formats a millisecond interval as "1.23s".
- `topic` must be one of the log topics and is replaced with the corresponding
  emoji.
- `stack` is expected to be a multi-line string and is indented.

## License

MIT

<div align="center">Made with ❤️ on 🌍</div>

[1]: http://ndjson.org/
