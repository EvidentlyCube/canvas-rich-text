import * as CanvasRichText from '../src/index';

const defaultText = `Hello!<br/>
Text
With
Newlines
<p>
	<b>&lt;b&gt;strong&lt;/b&gt;</b>
	<strong>&lt;strong&gt;strong&lt;/strong&gt;</strong>
</p>
<p>
	<i>&lt;i&gt;italic&lt;/i&gt;</i>
	<em>&lt;em&gt;italic&lt;/em&gt;</em>
</p>
<p size="30px">
	Starts
	<span size="25px">big</span>
	<span size="20px">but</span>
	<span size="15px">gets</span>
	<span size="10px">smaller</span>
</p>
<p>
	Colors:
	<span color="rgb(0, 50, 50)">RGB</span>
	<span color="rgba(0, 50, 50, 0.3)">RGBA</span>
	<span color="hsl(0, 50%, 50%)">HSL</span>
	<span color="hsla(0, 50%, 50%, 0.3)">HSLA</span>
	<span color="#F0F">Hex Short</span>
	<span color="#00FF88">Hex Long</span>
	<span color="aquamarine">Named</span>
</p>
<p>
	<span family="arial">Arial</span>
	<span family="verdana">Verdana</span>
	<span family="serif">Serif</span>
	<span family="Comic Sans MS">Comic Sans MS</span>
	<span family="courier">Courier</span>
	<span family="webdings">qwe</span>
	<span family="fantasy">cursive</span>
</p>
<p variant="small-caps">Very small caps</p>
`;

const canvas = document.getElementsByTagName('canvas')[0]!;
const context = canvas.getContext('2d')!;
const textarea = document.getElementsByTagName('textarea')[0]!;

textarea.value = defaultText;

Array.from(document.getElementsByTagName('input')).forEach(x => {
	x.addEventListener('input', () => redraw());
});
Array.from(document.getElementsByTagName('select')).forEach(x => {
	x.addEventListener('input', () => redraw());
});

textarea.addEventListener('input', () => redraw());

function getInput(name: string) {
	return Array.from(document.querySelectorAll<HTMLInputElement>(`input[name="${name}"], #${name}`)).map(x => {
		if (x.type === 'checkbox' || x.type === 'radio') {
			return x.checked ? x.value : undefined;
		}

		return x.value;
	}).filter(x => x !== undefined).join(' ');
}

redraw();

function redraw() {
	context.fillStyle = '#DDF8F8';
	context.fillRect(0, 0, canvas.width, canvas.height);

	CanvasRichText.defaultStyle.color = getInput('color');
	CanvasRichText.defaultStyle.fontSize = parseInt(getInput('font-size'));
	CanvasRichText.defaultStyle.fontStyle = getInput('font-style') as any;
	CanvasRichText.defaultStyle.fontWeight = getInput('font-weight') as any;
	CanvasRichText.defaultStyle.fontStretch = getInput('font-stretch') as any;
	CanvasRichText.defaultStyle.fontFamily = getInput('font-family');
	CanvasRichText.defaultStyle.fontVariant = getInput('font-variant') as any;

	const wrapWidth = parseInt(getInput('wrap-width'));
	const drawX = parseInt(getInput('draw-x'));
	const drawY = parseInt(getInput('draw-y'));
	const textAlign = getInput('text-align') as any;
	const tokenizedBlock = CanvasRichText.parseHtmlString(textarea.value, {
		spaceWidth: parseInt(getInput('space-width')),
		width: wrapWidth,
		lineSpacing: parseInt(getInput('line-spacing')),
		newLine: getInput('new-line') as any,
		whiteSpace: getInput('white-space') as any,
		textAlign: textAlign
	});
	const arrangedText = CanvasRichText.arrangeBlock(tokenizedBlock);

	const pullToCorner = getInput('pull-to-top-left');
	const offsetX = pullToCorner ? -arrangedText.x : 0;
	const offsetY = pullToCorner ? -arrangedText.y : 0;
	const finalDrawX = drawX + arrangedText.x + offsetX;
	const finalDrawY = drawY + arrangedText.y + offsetY;

	context.clearRect(0, 0, 500, 500);

	if (getInput('show-vertices')) {
		context.fillStyle = "#CCFFFF"
		for (const vertex of arrangedText.vertices) {
			context.fillRect(drawX + offsetX + vertex.x, drawY + offsetY + vertex.y, vertex.width, vertex.height);
		}
	}

	if (getInput('show-render-bounds')) {
		context.beginPath();
		context.strokeStyle = "#0000FF";
		context.setLineDash([3, 3]);
		context.moveTo(finalDrawX, finalDrawY);
		context.lineTo(finalDrawX + arrangedText.width, finalDrawY);
		context.lineTo(finalDrawX + arrangedText.width, finalDrawY + arrangedText.height);
		context.lineTo(finalDrawX, finalDrawY + arrangedText.height);
		context.lineTo(finalDrawX, finalDrawY);
		context.stroke();
	}

	if (getInput('show-word-wrap-edge')) {
		context.beginPath();
		context.strokeStyle = "#FF0000";
		context.setLineDash([5, 5]);
		const leftX = wrapWidth + drawX + offsetX;
		const rightX = drawX + offsetX;

		switch(textAlign) {
			case 'left':
				context.moveTo(leftX, 0);
				context.lineTo(leftX, 500);
				context.stroke();
				break;
			case 'center':
				context.moveTo(leftX, 0);
				context.lineTo(leftX, 500);
				context.stroke();
				context.moveTo(rightX, 0);
				context.lineTo(rightX, 500);
				context.stroke();
				break;
			case 'right':
				context.moveTo(rightX, 0);
				context.lineTo(rightX, 500);
				context.stroke();
				break;
		}
	}

	CanvasRichText.drawArrangedText(
		arrangedText,
		context,
		drawX + offsetX,
		drawY + offsetY,
	);
}