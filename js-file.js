let gameBoard = function() {
  const rows = 3;
  const columns = 3;
  const board = [];
  
  for(let i = 0; i < rows; i++){
    board[i] = [];
    for(let j = 0; j < columns; j++){
      board[i].push(cell());
    }
  }

  const getBoard = () => board;

  const placeMarker = (x, y, player) => {
    if(board[y][x].getMarker() !== ''){
      return false;
    } else{
      board[y][x].addPlayerMarker(player);
      return true;
    }
  };

  const printBoard = () => {
    console.log(board.map((row) => row.map((cell) => cell.getMarker())));
  };
  return {getBoard, placeMarker, printBoard};
};

let cell = function() {
  let marker = '';
  const addPlayerMarker = (player) => {
    marker = player;
  }

  const getMarker = () => marker;
  return {
    addPlayerMarker,
    getMarker
  };
}

let gameController = function(){
  let playerOne = {name:"Player One", marker: "X"}; 
  let playerTwo = {name:"Player Two", marker: "O"};
  const board = gameBoard();

  const player = [{
    name: playerOne.name,
    marker: playerOne.marker
  },
  {
    name: playerTwo.name,
    marker: playerTwo.marker
  }];

  let activePlayer = player[0];

  const switchPlayerTurn = () => {
    activePlayer = activePlayer === player[0] ? player[1]:
    player[0];
  };
  const getActivePlayer = () => activePlayer;

  const printNewRound = () => {
    board.printBoard();
    console.log(`${getActivePlayer().name}'s turn.`);
  };

  const checkIfWinner = (x,y,marker,currentBoard) => {
    let row = 0;
    let col = 0;
    let leftDiag = 0;
    let rightDiag = 0;
    for(let i = 0; i < currentBoard.length; i++){
      if(currentBoard[y][i].getMarker() == marker) row++;
      if(currentBoard[i][x].getMarker() == marker) col++;
      if(currentBoard[i][i].getMarker() == marker) leftDiag++;
      if(currentBoard[currentBoard.length - i - 1][i].getMarker() == marker) rightDiag++;
    }
    return (row == 3 || col == 3 || leftDiag == 3 || rightDiag == 3);
  };

  const totalMoves = 9; 
  let currentMoves = 0; 
  const playRound = (x,y) => {
    console.log(`tried to place ${getActivePlayer().marker} at [${x},${y}]`);
    if(!board.placeMarker(x, y, getActivePlayer().marker)){
      console.log(`[${x},${y}] is occupied`);
      return;
    }
    if(checkIfWinner(x,y,getActivePlayer().marker,board.getBoard())){
      return "win";
    }
    currentMoves++;
    if(currentMoves == totalMoves){
      return "draw";
    }
    console.log(currentMoves);

    switchPlayerTurn();
    printNewRound();
  };

  const reset = ()=> {
    const currentBoard = board.getBoard();
    currentBoard.forEach(row => {
      row.forEach(cell => {
        cell.addPlayerMarker('');
      });
    });
    currentMoves = 0;
    activePlayer = player[0];
  }
  printNewRound();

  return {
    playRound,
    getActivePlayer,
    getBoard: board.getBoard,
    reset
  }
};

let screenController = function(){
  const game = gameController();
  const playerTurnDiv = document.querySelector('.turn');
  const boardDiv = document.querySelector('.board');

  const updateScreen = (status) => {
    boardDiv.textContent = "";
    
    const board = game.getBoard();
    const activePlayer = game.getActivePlayer();

    playerTurnDiv.textContent = `${activePlayer.name}'s turn.`;

    board.forEach((row, rindex) => {
      row.forEach((cell, cindex) => {

        const cellButton = document.createElement("button");
        cellButton.classList.add("cell");
        cellButton.classList.add(`turn-${activePlayer.marker}`);
        cellButton.dataset.column = cindex;
        cellButton.dataset.row = rindex;

        //if cell has marker, add corresponding svg
        if(cell.getMarker() !== '') {
          cellButton.classList.add(`${cell.getMarker()}`)
          cellButton.disabled = true;
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          if(cell.getMarker() == "O"){
            cellButton.classList.add(`O`);
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svg.setAttribute("viewBox","0 0 512 512");
            svg.innerHTML = `<g transform="translate(42.666667, 42.666667)"> <path d="M213.333333,3.55271368e-14 C331.15408,3.55271368e-14 426.666667,95.5125867 426.666667,213.333333 C426.666667,331.15408 331.15408,426.666667 213.333333,426.666667 C95.5125867,426.666667 3.55271368e-14,331.15408 3.55271368e-14,213.333333 C3.55271368e-14,95.5125867 95.5125867,3.55271368e-14 213.333333,3.55271368e-14 Z M213.333333,106.666667 C154.42296,106.666667 106.666667,154.42296 106.666667,213.333333 C106.666667,272.243707 154.42296,320 213.333333,320 C272.243707,320 320,272.243707 320,213.333333 C320,154.42296 272.243707,106.666667 213.333333,106.666667 Z"/></g>`;
            cellButton.appendChild(svg);
            
          } else {
            cellButton.classList.add(`X`);
            svg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
            svg.setAttribute("viewBox","0 0 24 24");
            svg.innerHTML = `<g><path d="M20 6.91L17.09 4L12 9.09L6.91 4L4 6.91L9.09 12L4 17.09L6.91 20L12 14.91L17.09 20L20 17.09L14.91 12L20 6.91Z"/></g>`;
            cellButton.appendChild(svg);
          }
        }
        boardDiv.appendChild(cellButton);
      })
    })
    if(status == "win" || status == "draw") {
      const dialog = document.querySelector('dialog');
      dialog.textContent = status == "win" ? `Congratulations ${activePlayer.marker} won!` : `It was a draw!`;
      const replayButton = document.createElement("button");
      replayButton.textContent = "Replay?";
      replayButton.classList.add('.replay');
      dialog.appendChild(replayButton);
      dialog.showModal();
      replayButton.addEventListener("click", ()=>{
        dialog.close();
        game.reset();
        updateScreen();
      });
    }
  }

  function clickHandlerBoard(e){
    const selectedColumn = e.target.dataset.column;
    const selectedRow = e.target.dataset.row;
    if(!selectedColumn && !selectedRow) return;
    let status = '';
    status = game.playRound(selectedColumn,selectedRow);
    
    updateScreen(status);
  }

  boardDiv.addEventListener("click", clickHandlerBoard);

  updateScreen();

}

screenController();
