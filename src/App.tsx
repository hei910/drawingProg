import React, { useState } from 'react';
import './App.scss';

type params = string[];

function App() {
  const [ready, setReady] = useState(false);
  const [cmd, setCmd] = useState('');
  const [canvas, setCanvas] = useState<params[]>([]);
  const [canvasWH, setCanvasWH] = useState<[number, number]>([0,0]);
  const [canvasCached, setCanvasCached] = useState<params[]>([]);

  const run = (cmdStr: string) => {
    const cmdArr: string[] = cmdStr.split(' ');
    let [cmd, ...params] = cmdArr;
    cmd = cmd.toLowerCase();

    if (cmd === 'c') createCanvas(params);
    else if (cmd === 'l') line(params);
    else if (cmd === 'r') rect(params);
    else if (cmd === 'b') fill(params);
    else if (cmd === 'q') quit();
    else alert('Invalid command!')
  }

  const createCanvas = (params: params) => {
    if (params.length !== 2) return alert('Invalid input! Format: C w h');
    if (params.some(value => !value)) return alert('Invalid input! Format: R x1 y1 x2 y2');
    if (params.some(value => +value < 1)) return alert('Inputs must be larger than 1');
    const w = +params[0];
    const h = +params[1];
    const canvas: params[] = [];
    for (let i = 0; i <= h + 1; i++) {
      canvas.push([]);
      for (let k = 0; k <= w + 1; k++) {
        const char = i === 0 || i === h +1 
          ? '—'
          : k === 0 || k === w + 1 
            ? '|'
            : '';
        canvas[i].push(char);
      }
    }
    setCanvas(canvas);
    setCanvasWH([w, h]);
  }

  const line = (params: params) => {
    const [x1, y1, x2, y2] = params;
    if (!checkHasCanvas()) return alert('Create a canvas first. i.e. C 10 20');
    if (params.some(value => !value)) return alert('Invalid input! Format: R x1 y1 x2 y2');
    if (params.some(value => +value < 1)) return alert('Inputs must be larger than 1');
    if ((x1 !== x2) && (y1 !== y2)) return alert('Currently only horizontal or vertical lines are supported.');
    if (!checkXY([x1, x2], [y1, y2])) return alert('Cannot input values which are larger than the size of the canvas!');

    const newCanvas = [...canvas];
    if (x1 === x2) {
      for (let i = +y1; i <= +y2; i++) {
        newCanvas[i][+x1] = 'X';
      }
    }
    if (y1 === y2) {
      for (let i = +x1; i <= +x2; i++) {
        newCanvas[+y1][i] = 'X';
      }
    }
    setCanvas(newCanvas);
  }

  const rect = ([x1, y1, x2, y2]: params) => {
    line([x1,y1,x1,y2]);
    line([x1,y1,x2,y1]);
    line([x2,y1,x2,y2]);
    line([x1,y2,x2,y2]);
  }

  const fill = ([x, y, color]: params) => {
    if (!checkXY([x], [y])) return alert('Cannot input values which are larger than the size of the canvas!');
    if ([x, y].some(value => +value < 1)) return alert('Inputs must be larger than 1');

    const colorToReplace = canvas[+y][+x];
    canvas[+y][+x] = color;
    if (canvas[+y + 1][+x] === colorToReplace) fill([x, (+y+1).toString(), color]);
    if (canvas[+y - 1][+x] === colorToReplace) fill([x, (+y-1).toString(), color]);
    if (canvas[+y][+x + 1] === colorToReplace) fill([(+x+1).toString(), y, color]);
    if (canvas[+y][+x - 1] === colorToReplace) fill([(+x-1).toString(), y, color]);
  }

  const quit = () => {
    setCanvasCached([...canvas]);
    setCanvas([]);
    setCanvasWH([0,0]);
    setReady(false);
  }

  const checkHasCanvas = (c: params[] = canvas): boolean => {
    return !!c.length && !!c[1]?.length;
  }

  const checkXY = (xArr: string[], yArr: string[]): boolean => {
    return !xArr.some(x => +x > canvasWH[0]) && !yArr.some(y => +y > canvasWH[1]);
  }

  const onkeydown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') onSubmit();
  }

  const getCellClassName = (char: string) => {
    if (char === 'X') return ' filled';
    if (char === '—' || char === '|') return ' no-border';
    return '';
  }

  const onSubmit = () => {
    run(cmd);
    setCmd('');
  }

  return (
    <div className="App">
      <div className="wrapper">
        <h1>Drawing Programme</h1>

        <div className="drawing">
          <div className="canvas">
            {(ready ? canvas : canvasCached).map((row, idx) => (
              <div key={'row-'+idx} className="row">
                {row.map((cell, idx) => (
                  <div key={'cell-'+idx} className={'cell' + getCellClassName(cell)}>{cell}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
        { ready ? (
          <div className="input">
            <input type="text" 
              value={cmd} 
              onChange={(e) => setCmd(e.target.value)} 
              onKeyDown={onkeydown}
              placeholder="Type your command here..."
            />
            <input type="submit" onClick={onSubmit} value="Run" />
          </div>
        ) : (
          <div className="input">
            <button onClick={() => setReady(true)}>
              { !checkHasCanvas(canvasCached) ? 'Start Drawing!' : 'Re-draw!' }
            </button>
          </div>
        )}

        <div className="desc">
          <table>
            <tbody>
            <tr>
              <th>Command</th>
              <th>Description</th>
            </tr>
            <tr>
              <td>C w h</td>
              <td>Should create a new canvas of width w and height h.</td>
            </tr>
            <tr>
              <td>L x1 y1 x2 y2</td>
              <td>
                Should create a new line from (x1,y1) to (x2,y2). Currently only 
                horizontal or vertical lines are supported. Horizontal and vertical lines
                will be drawn using the 'x' character.
              </td>
            </tr>
            <tr>
              <td>R x1 y1 x2 y2</td>
              <td>
                Should create a new rectangle, whose upper left corner is (x1,y1) and
                lower right corner is (x2,y2). Horizontal and vertical lines will be drawn
                using the 'x' character.
              </td>
            </tr>
            <tr>
              <td>B x y c</td>
              <td>
                Should fill the entire area connected to (x,y) with "colour" c. The
                behavior of this is the same as that of the "bucket fill" tool in paint
                programs.
              </td>
            </tr>
            <tr>
              <td>Q</td>
              <td>Should quit the program.</td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;
