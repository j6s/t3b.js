t3b - contributing
===

Apart from the core, there are 3 important parts of the bot:

Commands
---
A Command is executed, if a received message matches certain criteria (e.g. starts with `!github`).

With commands you can implement fun interactive stuff

### Adding a Command
To add a Command, simply create a file in `src/commands/` that ends with `...Command.js`. That file should export a class
implementing 2 functions: `exec` and `match`. You can use `src/commands/__stub.js` as a Starting point.

### Examples for Commands
- `!github user` to get information about a user
- `!ter news` to get TER information about the news extension
- `!cache` to get a cache-clearing meme


Handlers
---
Handler are a stripped down version of Commands without the criteria part: A handler is just a single function that is
executed every time the bot receives a message. Before blindly implementing a handler, think about using a restricted Command
first.

### Adding a Handler

To add a handler, just create a file in `src/handlers`, that exports a single function. The function will receive a message
object like the following:
```
{
    message:    'test',
    from:       'thephpjo',
    to:         '#typo3'
}
```

### Examples for Handlers
- logging: Every message is getting logged
- collection stats


Services
---
Services do not depend on messages being received - they can be used to implement recurring or background tasks, that 
are triggered by information from the outside rather than messages. An example is the RssService, that checks a RSS feed
every x minutes and posts to the chatroom, if something new is received

### Adding a Service
To add a service, simply create a file in `src/services/` that ends with `...Service.js`. That file should export a class
implementing 3 functions: `exec`, `register` and `unregister`. You can use `src/services/__stub.js` as a Starting point.

### Examples for Services
- RssService to notify users about new Articles
- GitService to notify about new commits