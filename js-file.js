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
        cellButton.dataset.column = cindex;
        cellButton.dataset.row = rindex;
        if(cell.getMarker() !== '') cellButton.classList.add(`${cell.getMarker()}`);
        if(cell.getMarker() == "X" || cell.getMarker() == "O") {
          cellButton.disabled = true;
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
