# Canvas Rich Text

[![Build Status](https://travis-ci.com/EvidentlyCube/canvas-rich-text.svg?branch=master)](https://travis-ci.com/EvidentlyCube/canvas-rich-text)

A way to render rich text in Canvas without resorting to SVG's `<foreignObject>`. It supports a very limited subset of HTML and CSS.

## Getting Started

This library was written in TypeScript but will also work in projects written in JavaScript.

### Installing

Add it to your project via:

```
npm i --save canvas-rich-text
```

### Demo

You can find an interactive demo [here](https://evidentlycube.github.io/canvas-rich-text/demo/index.html).

### Documentation

The full documentation can be found [here](https://evidentlycube.github.io/canvas-rich-text/index.html).

The library can be used like this:

```
import {arrangeText, renderArrangedText, HtmlTokenizer} from 'canvas-rich-text';

const text = `<p>Paragraph <strong>bold</strong> <em>italic</em></p>`;
const tokens = HtmlTokenizer.tokenizeString(text);
const arrangedText = arrangeText(tokens, {
    wordWrapWidth: 300,
    spaceWidth: 8,
    lineSpacing: 5
});
renderArrangedText(arrangedText, canvas, 0, 0);
```   

## Details

The library works in three steps:

 1. Convert HTML text into tokens.
 2. Arrange tokens into arranged text.
 3. Render the arranged text.

You can write your own parser to create the tokens from any format you want, or create the tokens directly.


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Links

* [NPM](https://www.npmjs.com/package/canvas-rich-text)
* [Travis-ci](https://travis-ci.com/EvidentlyCube/canvas-rich-text) 