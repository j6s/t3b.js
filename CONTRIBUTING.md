t3b - contributing
===

Adding a Command
---

To add a command you have to add a file containing a Command Class in the `src/commands` folder.

You can use the class in `__stub` as a starting point and make shure the filename ends with `...Command.js` 

Adding a handler
---

A handler is called on every message. To add a handler you can simply create a JavaScript file in the `src/handlers` folder
and export a function that shall be called. The function receives one argument:
`
{
    message:    'test',
    from:       'thephpjo',
    to:         '#typo3'
}
`