import './style.css'
import {HtmlTokenizer} from "./html/HtmlTokenizer";
import {RichTextRenderer} from "./RichTextRenderer";

const app = document.querySelector<HTMLDivElement>('#app')!
const input = document.createElement('input');

input.value = `<p>
	<span size="15">This</span>
	<span size="20">This</span>
	<span size="25" weight="bold">This</span>
	<span size="30">This</span>
	<span size="35" fontVariant="small-caps">This</span>
	<span size="40">This</span>
	</p>lol<br/>pop a`
input.oninput = redraw;

const canvas = document.createElement('canvas');
canvas.width = 500;
canvas.height = 500;
const context = canvas.getContext('2d')!;

app.appendChild(input);
app.appendChild(document.createElement('br'));
app.appendChild(canvas);

redraw();
function redraw() {
	const tokens = HtmlTokenizer.tokenizeString(input.value);
	console.log(tokens);
	const lines = RichTextRenderer.arrangeText(tokens, {
		width: 2500
	});

	context.clearRect(0, 0, 500, 500);
	RichTextRenderer.renderLines(lines, context, 0, 50);

	const line = (color: string, y: number) => {
		context.fillStyle = color;
		context.fillRect(x, y, 200, 1)
	}

	const x = 100;
	const y = 200;
	context.font = "50px arial";
	context.textBaseline = "alphabetic";


	let m = context.measureText('ee');
	context.fillText("ee", x, y);
	line('#FF0000', y);
	line('#00FF00', y - m.actualBoundingBoxAscent);
	line('#0000FF', y + m.actualBoundingBoxDescent);


	m = context.measureText('Tj');
	context.fillText("Tj", x + 50, y);
	line('#FF0000', y);
	line('#00FF00', y - m.actualBoundingBoxAscent);
	line('#0000FF', y + m.actualBoundingBoxDescent);
}