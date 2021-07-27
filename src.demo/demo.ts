import * as CanvasRichText from '../src/index';

const defaultText = `Hello!<br/>
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
	CanvasRichText.defaultStyle.fontSize = getInput('font-size') + "px";
	CanvasRichText.defaultStyle.fontStyle = getInput('font-style') as any;
	CanvasRichText.defaultStyle.fontWeight = getInput('font-weight') as any;
	CanvasRichText.defaultStyle.fontStretch = getInput('font-stretch') as any;
	CanvasRichText.defaultStyle.fontFamily = getInput('font-family');
	CanvasRichText.defaultStyle.fontVariant = getInput('font-variant') as any;

	const wrapWidth = parseInt(getInput('wrap-width'));
	const drawX = parseInt(getInput('draw-x'));
	const drawY = parseInt(getInput('draw-y'));
	const tokens = CanvasRichText.HtmlTokenizer.tokenizeString(textarea.value);
	const arrangedText = CanvasRichText.arrangeText(tokens, {
		width: wrapWidth,
		spaceWidth: parseInt(getInput('space-width')),
		lineSpacing: parseInt(getInput('line-spacing')),
	});

	context.clearRect(0, 0, 500, 500);
	context.beginPath();
	context.strokeStyle = "#FF0000";
	context.setLineDash([5, 5]);
	context.moveTo(wrapWidth + drawX, drawY);
	context.lineTo(wrapWidth + drawX, drawY + arrangedText.height);
	context.stroke();

	context.beginPath();
	context.strokeStyle = "#0000FF";
	context.setLineDash([3, 3]);
	context.moveTo(drawX, drawY);
	context.lineTo(drawX + arrangedText.width, drawY);
	context.lineTo(drawX + arrangedText.width, drawY + arrangedText.height);
	context.lineTo(drawX, drawY + arrangedText.height);
	context.lineTo(drawX, drawY);
	context.stroke();

	console.log(arrangedText);

	CanvasRichText.renderArrangedText(
		arrangedText,
		context,
		drawX,
		drawY,
	);
}