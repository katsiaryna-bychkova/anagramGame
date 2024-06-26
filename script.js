const LEVELS = [1, 2, 3];
const FIRST_LEVEL = 1;

const AMAZING = 'Изумительно!';
const LEVEL = 'Уровень';

const LEVEL_KEY = 'level';
const LEVEL_COUNTER_KEY = 'levelCounter';
const NEXT_LEVEL_KEY = 'nextLevel';

const WORD_INDICES = 'wordIndices';

const WHITE_COLOR = '#FFFFFF';
const PINK_COLOR = '#E96FA4';
const GRAY_COLOR = '#4D4D4D';

let words = [];
let myWord = [];
let activeDiv = null;

const dialogWindow = document.querySelector('.overlay');
const levelContainer = document.querySelector('.level');
const mainContainer = document.querySelector('.main-сontainer');
const lettersContainer = document.querySelector('.outer-circle');
const victoryContainer = document.querySelector('.victory-container');

class Storage {
  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  static get(key) {
    return JSON.parse(localStorage.getItem(key));
  }
}

class LevelManager {
  static levels = [1, 2, 3];
  static firstLevel = 1;

  static get level() {
    return Storage.get(LEVEL_KEY) || this.firstLevel;
  }

  static set level(level) {
    Storage.set(LEVEL_KEY, level);
  }

  static get levelCounter() {
    return Storage.get(LEVEL_COUNTER_KEY) || this.firstLevel;
  }

  static set levelCounter(levelCounter) {
    Storage.set(LEVEL_COUNTER_KEY, levelCounter);
  }

  static get nextLevel() {
    const nextLevel = this.level + 1 > this.levels.length ? this.firstLevel : this.level + 1;
    Storage.set(NEXT_LEVEL_KEY, nextLevel);
    return nextLevel;
  }

  static updateLevel() {
    this.levelCounter++;
    this.level = this.nextLevel;
  }

  static updateTextLevel() {
    const levelText = document.querySelector('span');
    levelText.innerText = `${LEVEL} ${this.levelCounter}`;
  }

  static saveLevel() {
    Storage.set(NEXT_LEVEL_KEY, this.nextLevel);
  }

  static showLevel() {
    const levelText = document.createElement('span');
    levelText.innerText = `${LEVEL} ${LevelManager.levelCounter}`;
    levelContainer.appendChild(levelText);
  }
}

window.addEventListener('storage', (e) => {
  if (e.key === 'openpages') {
    dialogWindow.classList.add('flex-container');
  }
});

document.querySelector('.refresh-window').addEventListener('click', function() {
  location.reload();
});

document.addEventListener('pointerup', handlePointerUp);
document.addEventListener('touchend', handlePointerUp);

function handlePointerUp() {
  const elements = document.querySelectorAll('.inner-circle');
  elements.forEach((element) => {
    element.style.color = WHITE_COLOR;
    element.style.backgroundColor = PINK_COLOR;
    
    element.removeEventListener('pointerover', handlePointerOver); 
    element.removeEventListener('pointerdown', handlePointerDown); 
  });

  const indexWord = words.indexOf(myWord.join(''));

  if (indexWord !== -1) {
    const wordIndices = Storage.get(WORD_INDICES) || [];
    wordIndices.push(indexWord);

    Storage.set(WORD_INDICES, wordIndices);

    highlightRightWords(indexWord);
  }

  setTimeout(() => checkAllSquaresHaveRightWord(), 1000);

  myWord = [];
  removeAllElementsById('myWord');
}

Storage.set('openpages', Date.now());

startGame(LevelManager.level);

function startGame(level) {
  LevelManager.saveLevel();
  LevelManager.showLevel();
  fetchData(level).then((levelData) => displayLevelData(levelData));
}

// read file

async function fetchData(level) {
  try {
    const response = await fetch(`levels/${level}.json`);
    const data = await response.json();

    return data.words;
  } catch (error) {
    console.error("Ошибка при загрузке файла:", error);
  }
}

function displayLevelData(levelData) {
  words = levelData;
  const numbersOfSquares = words.map((word) => word.length);
  numbersOfSquares.forEach(createSquares);

  const letters = [...new Set(words.join(""))];
  letters.forEach(showLetterCircles);

  const wordIndices = Storage.get(WORD_INDICES) || [];
  wordIndices.forEach(highlightRightWords);
}


// words

function createSquares(count) {
  const block = document.createElement('div');
  block.classList.add('container');
  mainContainer.appendChild(block);

  for (let i = 0; i < count; i++) {
    const square = document.createElement('div');
    square.classList.add('square');

    block.appendChild(square);
  }
  
}

function highlightRightWords(indexWord) {
  const containers = document.querySelectorAll('.container');

  const highlightWord = myWord.length ? myWord : Array.from(words[indexWord]);
  
  if (indexWord !== -1) {
    const squares = containers[indexWord].querySelectorAll('.square');
    squares.forEach((square, index) => {
      square.classList.add('right-word');
      square.textContent = highlightWord[index];
    });
  }
}
 
function removeSquares() {
  const squares = mainContainer.getElementsByClassName('container');

  while (squares.length > 0) {
    squares[0].remove();
  }
}

function showText(text) {
  const textDiv = document.createElement('div');
  textDiv.textContent = text;
  textDiv.classList.add('little-square');
  document.getElementById('myWord').appendChild(textDiv);
}

// letters

function handlePointerOver(event) {
  const hoveredElement = event.target;
  hoveredElement.style.color = GRAY_COLOR;
  hoveredElement.style.backgroundColor = WHITE_COLOR;

  myWord.push(hoveredElement.textContent);
  showText(hoveredElement.textContent);
}

function handlePointerDown(element) {
  element.style.color = GRAY_COLOR;
  element.style.backgroundColor = WHITE_COLOR;

  myWord.push(element.textContent);
  showText(element.textContent);

  const innerElements = document.querySelectorAll('.inner-circle');

  innerElements.forEach((element) => {
    element.addEventListener('pointerover', handlePointerOver); 
  });
}

document.addEventListener('touchmove', function(e) {
  const touch = e.touches[0];
  const element = document.elementFromPoint(touch.clientX, touch.clientY);

  if (element && element.className === 'inner-circle') {
    if (activeDiv !== element) {
      element.style.color = GRAY_COLOR;
      element.style.backgroundColor = WHITE_COLOR;

      myWord.push(element.textContent);
      showText(element.textContent);
    }

    activeDiv = element;
  } else {
    activeDiv = null;
  }
});

function removeAllElementsById(id) {
  const container = document.getElementById(id);

  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
}

function showLetterCircles(letter) {
  const circle = document.createElement('div');
  circle.textContent = letter;
  circle.classList.add('inner-circle');
  circle.onpointerdown = function() { 
    handlePointerDown(this);
  };

  lettersContainer.appendChild(circle);

  addStylesToLetterCircle();
}

function addStylesToLetterCircle() {
  const innerCircles = document.querySelectorAll('.inner-circle');

  const angleStep = 360 / innerCircles.length;

  innerCircles.forEach((circle, index) => {
    const angle = index * angleStep;
    const radians = (angle * Math.PI) / 180;

    const radius = 50; 
    const x = radius * Math.cos(radians);
    const y = radius * Math.sin(radians);
    
    circle.style.top = `${50 + y}%`;
    circle.style.left = `${50 + x}%`;
    circle.style.transform = `translate(-50%, -50%)`;
  });
}

function removeLetterCircles() {
  const lettersCircles = lettersContainer.getElementsByClassName('inner-circle');

  while (lettersCircles.length > 0) {
    lettersCircles[0].remove();
  }
}


// check next level

function checkAllSquaresHaveRightWord() {
  const squares = document.querySelectorAll('.square');
  let countRightSquares = 0;
  const levelCounter = LevelManager.levelCounter;
  const nextLevel = levelCounter + 1;

  for (const square of squares) {
    if (square.classList.contains('right-word')) {
      countRightSquares++;
    }
  }

  if (countRightSquares === squares.length && squares.length) {
    mainContainer.classList.add('hidden');
    lettersContainer.classList.add('hidden');
    levelContainer.classList.add('hidden');

    const victoryMassage = document.createElement('p');
    const victoryWord = document.createElement('p');

    victoryWord.textContent = AMAZING;
    victoryMassage.textContent = `${LEVEL} ${levelCounter} пройден`;
    victoryMassage.classList.add('victory-element');
    victoryMassage.appendChild(victoryWord);
    
    victoryContainer.appendChild(victoryMassage);

    const nextLevelButton = document.createElement('div');
    nextLevelButton.classList.add('next-level-button');
    nextLevelButton.classList.add('victory-element');
    nextLevelButton.textContent = `${LEVEL} ${nextLevel}`;

    nextLevelButton.onclick = function() {
      showNextLevel();
    };

    victoryContainer.classList.remove('hidden'); 

    victoryContainer.appendChild(nextLevelButton);

    removeSquares();
  }
  
}

function cleanVictoryContainer() {
  const elements = victoryContainer.querySelectorAll('.victory-element');
  elements?.forEach((el) => el.remove());
}

function showNextLevel() {
  victoryContainer.classList.add('hidden');

  mainContainer.classList.remove('hidden'); 
  lettersContainer.classList.remove('hidden'); 
  levelContainer.classList.remove('hidden'); 

  removeLetterCircles();
  cleanVictoryContainer();

  LevelManager.updateLevel();
  LevelManager.updateTextLevel();

  Storage.set(WORD_INDICES, []);

  fetchData(LevelManager.level).then((levelData) => displayLevelData(levelData));
}

