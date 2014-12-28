t3b.js
======

Small chatbot for the #TYPO3 irc channel.

Purpose
---

The purpose of this bot is to make staying in the `#TYPO3` irc channel more enjoyable by adding simple features

Commands
---
Currently there only are a few commands:

- `!cache`  Prints a link to a meme about clearing the cache (inpired by Akiii and Xatenev)
    ```
    !cache
        => http://treasure.diylol.com/uploads/post/image/463404/resized_all-the-things-meme-generator-clear-all-the-caches-66ad82.jpg
        
    !cache 
        => http://sd.keepcalm-o-matic.co.uk/i/keep-calm-and-clear-cache-11.png
    ```

- `!ping`   Answers with _"pong"_
    ```
    !ping
        => pong
    ```

- `!github` Displays information about a user / a repository
    ```
    !github thephpjo
        => thephpjo: Johannes (NIMIUS) - repos: 28, gists: 18 - https://github.com/thephpjo
    
    !github thephpjo/t3b.js
        => t3b.js by thephpjo (JavaScript): 0 issues, 0 forks, 0 watchers - https://github.com/thephpjo/t3b.js (last updated 2014-12-28T01:22:23Z)
    ```

TODO
---

- Implement a `!ter` Command, that gets information about an Extension from the TER
- Implement a message on TYPO3 news (from the rss feed)