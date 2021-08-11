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
import {arrangeBlock, drawArrangedText, parseHtmlString, Styles} from "../src";

const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
document.querySelector('body')!.appendChild(canvas);

if (!context) {
	throw new Error("Failed to create canvas' 2d context");
}

const exampleHtml = `<p align="center">
	<strong>Bold</strong> and <span size="50">Big</span> text is <span color="rgba(255, 0, 0, 0.3)">RED</span>..
</p>`;

const style: Partial<Styles.StyleOptions> = {
	width: 120,
	newLine: "ignore",
	whiteSpace: 'collapse-all',
};

// Convert HTML into a Block
const textBlock = parseHtmlString(exampleHtml, style);
// Arrange the block for drawing
const arrangedText = arrangeBlock(textBlock);
// Draw the arranged text
drawArrangedText(arrangedText, context, 10, 10);
```   

## Details

The library works in three steps:

 1. Convert HTML text into a Block.
 2. Arrange the block into vertices.
 3. Render the arranged text.

You can write your own parser to create the tokens from any format you want, or create the tokens directly.


## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Links

* [NPM](https://www.npmjs.com/package/canvas-rich-text)
* [Travis-ci](https://travis-ci.com/EvidentlyCube/canvas-rich-text) 