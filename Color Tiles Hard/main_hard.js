var buttons = [];
var solutiongrids = [];
var colors = ["red", "blue", "green", "yellow", "orange", "white"];
var puzzlecolors = [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]];
var solutioncolors = [];
var objectthis;
const solution = document.querySelector('.solutiongrid');
const bgm = document.querySelector(".bgm");
var soundbutton = document.querySelector(".sound");
const instructions = document.querySelector(".instructions");


function generatePuzzle() {
  for(let i=0; i<6; i++) {
    for(let j=0; j<6; j++) {
      var newColor = colors[Math.floor(Math.random() * colors.length)];
      puzzlecolors[i][j]=newColor;
    }
  }
}

function createSolution() {
  for(let i=0; i<16; i++) {
    solutiongrid = document.createElement("button");
    solution.appendChild(solutiongrid);
    solutiongrids.push(solutiongrid);
  }
}
createSolution();

function generateSolution() {
  solutioncolors = [];
  let tempcolors=[];
  for(let i=0; i<6; i++) {
    tempcolors.push(...puzzlecolors[i]);
  }
  for (let i=0; i<16; i++) {
    newIndex = Math.floor(Math.random() * tempcolors.length);
    solutiongrids[i].style.backgroundColor = tempcolors[newIndex];
    solutioncolors.push(tempcolors[newIndex]);
    tempcolors.splice(newIndex, 1);
  }
}


class Box {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  getTopBox() {
    if (this.y === 0) return null;
    return new Box(this.x, this.y - 1);
  }

  getRightBox() {
    if (this.x === 5) return null;
    return new Box(this.x + 1, this.y);
  }

  getBottomBox() {
    if (this.y === 5) return null;
    return new Box(this.x, this.y + 1);
  }

  getLeftBox() {
    if (this.x === 0) return null;
    return new Box(this.x - 1, this.y);
  }

  getNextdoorBoxes() {
    return [
      this.getTopBox(),
      this.getRightBox(),
      this.getBottomBox(),
      this.getLeftBox()
    ].filter(box => box !== null);
  }

  getRandomNextdoorBox() {
    const nextdoorBoxes = this.getNextdoorBoxes();
    return nextdoorBoxes[Math.floor(Math.random() * nextdoorBoxes.length)];
  }
}

const swapBoxes = (grid, box1, box2) => {
  const temp1 = grid[box1.y][box1.x];
  grid[box1.y][box1.x] = grid[box2.y][box2.x];
  grid[box2.y][box2.x] = temp1;

  const temp2 = puzzlecolors[box1.y][box1.x];
  puzzlecolors[box1.y][box1.x] = puzzlecolors[box2.y][box2.x];
  puzzlecolors[box2.y][box2.x] = temp2;

};

const isSolved = grid => {
  return (
    puzzlecolors[1][1] === solutioncolors[0] &&
    puzzlecolors[1][2] === solutioncolors[1] &&
    puzzlecolors[1][3] === solutioncolors[2] &&
    puzzlecolors[1][4] === solutioncolors[3] &&
    puzzlecolors[2][1] === solutioncolors[4] &&
    puzzlecolors[2][2] === solutioncolors[5] &&
    puzzlecolors[2][3] === solutioncolors[6] &&
    puzzlecolors[2][4] === solutioncolors[7] &&
    puzzlecolors[3][1] === solutioncolors[8] &&
    puzzlecolors[3][2] === solutioncolors[9] &&
    puzzlecolors[3][3] === solutioncolors[10] &&
    puzzlecolors[3][4] === solutioncolors[11] &&
    puzzlecolors[4][1] === solutioncolors[12] &&
    puzzlecolors[4][2] === solutioncolors[13] &&
    puzzlecolors[4][3] === solutioncolors[14] &&
    puzzlecolors[4][4] === solutioncolors[15]
  );
};

const getRandomGrid = () => {
  let grid = [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12], [13, 14, 15, 16, 17, 18], [19, 20, 21, 22, 23, 24], [25, 26, 27, 28, 29, 30], [31, 32, 33, 34, 35, 0]];

  // Shuffle
  let blankBox = new Box(5, 5);
  for (let i = 0; i < 1000; i++) {
    const randomNextdoorBox = blankBox.getRandomNextdoorBox();
    swapBoxes(grid, blankBox, randomNextdoorBox);
    blankBox = randomNextdoorBox;
  }

  return grid;
};

class State {
  constructor(grid, move, time, status) {
    this.grid = grid;
    this.move = move;
    this.time = time;
    this.status = status;
  }

  static ready() {
    return new State(
      [[0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]],
      0,
      0,
      "ready"
    );
  }

  static start() {
    return new State(getRandomGrid(), 0, 0, "playing");
  }
}

class Game {
  constructor(state) {
    this.state = state;
    this.tickId = null;
    this.tick = this.tick.bind(this);
    this.render();
    instancecopy(this);
    this.handleClickBox = this.handleClickBox.bind(this);
  }

  static ready() {
    return new Game(State.ready());
  }

  tick() {
    this.setState({ time: this.state.time + 1 });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }

  handleClickBox(box) {
    return function() {
      console.log(puzzlecolors)
      console.log(solutioncolors)
      const nextdoorBoxes = box.getNextdoorBoxes();
      const blankBox = nextdoorBoxes.find(
        nextdoorBox => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0
      );
      if (blankBox) {
        const newGrid = [...this.state.grid];
        playswap();
        swapBoxes(newGrid, box, blankBox);
        if (isSolved(newGrid)) {
          clearInterval(this.tickId);
          this.setState({
            status: "won",
            grid: newGrid,
            move: this.state.move + 1
          });
        } else {
          this.setState({
            grid: newGrid,
            move: this.state.move + 1
          });
        }
      }
    }.bind(this);
  }

  KeyPress(box) {
    console.log(puzzlecolors)
    console.log(solutioncolors)
    const nextdoorBoxes = box.getNextdoorBoxes();
    const blankBox = nextdoorBoxes.find(
      nextdoorBox => this.state.grid[nextdoorBox.y][nextdoorBox.x] === 0
      );
    if (blankBox) {
      const newGrid = [...this.state.grid];
      playswap();
      swapBoxes(newGrid, box, blankBox);
      if (isSolved(newGrid)) {
        clearInterval(this.tickId);
        this.setState({
          status: "won",
          grid: newGrid,
          move: this.state.move + 1
        });
      } else {
        this.setState({
          grid: newGrid,
          move: this.state.move + 1
        });
      }
    }
  }


  render() {
    const { grid, move, time, status } = this.state;
    buttons = [];

    // Render grid
    const newGrid = document.createElement("div");
    newGrid.className = "grid";
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 6; j++) {
        const button = document.createElement("button");
        button.classList.add("b"+i+j);
        buttons.push(button);
        button.style.backgroundColor = grid[i][j] === 0 ? "#3d3d3d" : puzzlecolors[i][j];

        if (grid[i][j] === 0){
          puzzlecolors[i][j] = "0";
        
          if(i!==0 && i!==5 && j!==0 && j!==5){
            button.style.backgroundColor = "#0e0e0e"
          }
        }

        if (status === "playing") {
          button.addEventListener("click", this.handleClickBox(new Box(j, i)));
        }

        newGrid.appendChild(button);
      }
    }
    const blackbox = document.createElement("div");
    blackbox.classList.add("black-box");
    newGrid.appendChild(blackbox);
    document.querySelector(".grid").replaceWith(newGrid);

    // Render button
    const newButton = document.createElement("button");
    if (status === "ready") newButton.textContent = "Play";
    if (status === "playing") newButton.textContent = "Reset";
    if (status === "won") newButton.textContent = "Play";
    newButton.addEventListener("click", () => {
      generatePuzzle();
      generateSolution();
      if(soundbutton.textContent === "🔊") {
        playbgm();
      }
      clearInterval(this.tickId);
      this.tickId = setInterval(this.tick, 1000);
      this.setState(State.start());
    });
    document.querySelector(".footer button").replaceWith(newButton);

    // Render move
    document.getElementById("move").textContent = `Moves: ${move}`;

    // Render time
    document.getElementById("time").textContent = `Time: ${time}`;

    // Render message
    if (status === "won") {
      const endscreen = document.createElement("div");
      endscreen.classList.add("endScreen");
      const message = document.createElement("h1");
      message.classList.add("message");
      message.innerHTML = "You Win!";
      const tryagain = document.createElement("div");
      tryagain.classList.add("try-again");
      tryagain.innerHTML = "Play Again";
      document.querySelector(".grid").appendChild(endscreen);
      document.querySelector(".grid").appendChild(message);
      document.querySelector(".grid").appendChild(tryagain);

      tryagain.addEventListener("click", () => {
        generatePuzzle();
        generateSolution();
        clearInterval(this.tickId);
        this.tickId = setInterval(this.tick, 1000);
        this.setState(State.start());
      });
    }
  }
}

//...............................................

const GAME = Game.ready();

function instancecopy(object){
  objectthis = object;
}

//Adding ArrowKey Controls.
document.addEventListener("keydown", function(event){
  const { grid, move, time, status } = objectthis.state;
  myloop:
  for (let m = 0; m < 6; m++) {
    for (let n = 0; n < 6; n++) {
      if(event.key === "ArrowUp" && grid[m][n] === 0 && m!== 5 && status === "playing"){
        console.log("ArrowUp Pressed")
        objectthis.KeyPress(new Box(n, m+1));
        break myloop;
      }

      if(event.key === "ArrowDown" && grid[m][n] === 0 && m!== 0 && status === "playing"){
        console.log("ArrowDown Pressed")
        objectthis.KeyPress(new Box(n, m-1));
        break myloop;
      }

      if(event.key === "ArrowRight" && grid[m][n] === 0 && n!== 0 && status === "playing"){
        console.log("ArrowRight Pressed")
        objectthis.KeyPress(new Box(n-1, m));
        break myloop;
      }

      if(event.key === "ArrowLeft" && grid[m][n] === 0 && n!== 5 && status === "playing"){
        console.log("ArrowLeft Pressed")
        objectthis.KeyPress(new Box(n+1, m));
        break myloop;
      }
    }
  }
});

function playswap(){
  const swapsound = new Audio("../swap.wav");
    swapsound.play();
}

function playbgm(){
  bgm.loop = true;
  bgm.volume = 0.2;
  bgm.play();
}

function stopbgm(){
  bgm.pause();
}

soundbutton.addEventListener("click", () => {
  if(soundbutton.textContent === "🔊") {
    soundbutton.textContent = "🔇";
    stopbgm();
  }
  else{
    soundbutton.textContent = "🔊";
    playbgm();
  }
});

instructions.addEventListener("click", () => {
  alert("Given a 6x6 grid made with tiles of 6 different colors, the goal is to try and make this 4x4 grid in its center. Out of the 36 tiles, one will be empty which can be swapped with any of the four adjacent tiles.\r\nYou can use mouse clicks or arrow keys to move the tiles.");
});

const easy = document.querySelector(".easy");
easy.addEventListener("click",() => {
  window.location.href = "../index.html";
});

//Avoid arrows to scroll the page
window.addEventListener("keydown", function(event) {
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(event.code) > -1) {
      event.preventDefault();
  }
}, false);

