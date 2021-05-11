function playCatch() {
  const folder = window.folder;
  if (!folder) {
    return;
  }
  const canvas = document.getElementById('canvas');
  const context = canvas.getContext('2d');

  const frameRate = 40;

  // media load counter
  let loadCount = 0;
  const itemsToLoad = 16;

  // images
  let titleScreenImage;
  let titleScreenStartImage;
  let backgroundImage;
  let playerImage;
  let playerHurtImage;
  let good1Image;
  let good2Image;
  let ouchImage;
  let winImage;
  let loseImage;

  // sounds
  let titleScreenSound;
  let startSound;
  let periodSound;
  let gameMusicSound;
  let ouchSound;
  let buzzerSound;
  let good1Sound, good2Sound, boomSound;

  // application states
  let nextGameState = null;
  let currentGameStateFunction = null;

  // started indicators
  let titleStarted = false;

  // game environment
  let homeScore = 0;
  let visitorScore = 0;
  let good2Count = 0;
  let clock = 0;
  let secondFraction = 0;
  let period = 0;
  let waitTime = 0;
  let stunTimer = 0;

  // game objects
  const player = {};
  const good1 = {};
  const good2 = {};
  const ouch = {};

  player.hitWidth = 76;
  player.hitHeight = 121;
  good1.hitWidth = 26;
  good1.hitHeight = 23;
  good2.hitWidth = 50;
  good2.hitHeight = 45;
  ouch.hitWidth = 54;
  ouch.hitHeight = 84;

  // key presses
  const keyPressList = [];

  // eslint-disable-next-line no-unused-vars
  function itemLoaded(event) {
    loadCount++;
    if (loadCount === itemsToLoad) {
      titleScreenSound.removeEventListener(
        'titleScreenSound',
        itemLoaded,
        false,
      );
      startSound.removeEventListener('startSound', itemLoaded, false);
      periodSound.removeEventListener('periodSound', itemLoaded, false);
      gameMusicSound.removeEventListener('gameMusicSound', itemLoaded, false);
      ouchSound.removeEventListener('ouchSound', itemLoaded, false);
      buzzerSound.removeEventListener('buzzerSound', itemLoaded, false);
      currentGameStateFunction = gameStateTitle;
    }
  }

  function gameStateInit() {
    const soundFormat = 'mp3';

    titleScreenImage = new Image();
    titleScreenImage.src = `${folder}/images/title_screen.gif`;
    titleScreenImage.onload = itemLoaded;

    titleScreenStartImage = new Image();
    titleScreenStartImage.src = `${folder}/images/title_screen_start.gif`;
    titleScreenStartImage.onload = itemLoaded;

    backgroundImage = new Image();
    backgroundImage.src = `${folder}/images/background.gif`;
    backgroundImage.onload = itemLoaded;

    playerImage = new Image();
    playerImage.src = `${folder}/images/player.png`;
    playerImage.onload = itemLoaded;

    playerHurtImage = new Image();
    playerHurtImage.src = `${folder}/images/player_hurt.png`;
    playerHurtImage.onload = itemLoaded;

    good1Image = new Image();
    good1Image.src = `${folder}/images/good1.png`;
    good1Image.onload = itemLoaded;

    good2Image = new Image();
    good2Image.src = `${folder}/images/good2.png`;
    good2Image.onload = itemLoaded;

    ouchImage = new Image();
    ouchImage.src = `${folder}/images/ouch.png`;
    ouchImage.onload = itemLoaded;

    winImage = new Image();
    winImage.src = `${folder}/images/win.gif`;
    winImage.onload = itemLoaded;

    loseImage = new Image();
    loseImage.src = `${folder}/images/lose.gif`;
    loseImage.onload = itemLoaded;

    titleScreenSound = document.createElement('audio');
    document.body.appendChild(titleScreenSound);
    titleScreenSound.setAttribute(
      'src',
      `${folder}/sounds/titleScreen.${soundFormat}`,
    );
    titleScreenSound.setAttribute('type', `audio/${soundFormat}`);
    titleScreenSound.setAttribute('preload', 'auto');
    titleScreenSound.addEventListener('canplaythrough', itemLoaded, false);

    startSound = document.createElement('audio');
    document.body.appendChild(startSound);
    startSound.setAttribute('src', `${folder}/sounds/start.${soundFormat}`);
    startSound.setAttribute('type', `audio/${soundFormat}`);
    startSound.setAttribute('preload', 'auto');
    startSound.addEventListener('canplaythrough', itemLoaded, false);

    periodSound = document.createElement('audio');
    document.body.appendChild(periodSound);
    periodSound.setAttribute('src', `${folder}/sounds/period.${soundFormat}`);
    periodSound.setAttribute('type', `audio/${soundFormat}`);
    periodSound.setAttribute('preload', 'auto');
    periodSound.addEventListener('canplaythrough', itemLoaded, false);

    gameMusicSound = document.createElement('audio');
    document.body.appendChild(gameMusicSound);
    gameMusicSound.setAttribute(
      'src',
      `${folder}/sounds/gameMusic.${soundFormat}`,
    );
    gameMusicSound.setAttribute('type', `audio/${soundFormat}`);
    gameMusicSound.setAttribute('preload', 'auto');
    gameMusicSound.addEventListener('canplaythrough', itemLoaded, false);

    ouchSound = document.createElement('audio');
    document.body.appendChild(ouchSound);
    ouchSound.setAttribute('src', `${folder}/sounds/ouch.${soundFormat}`);
    ouchSound.setAttribute('type', `audio/${soundFormat}`);
    ouchSound.setAttribute('preload', 'auto');
    ouchSound.addEventListener('canplaythrough', itemLoaded, false);

    buzzerSound = document.createElement('audio');
    document.body.appendChild(buzzerSound);
    buzzerSound.setAttribute('src', `${folder}/sounds/buzzer.${soundFormat}`);
    buzzerSound.setAttribute('type', `audio/${soundFormat}`);
    buzzerSound.setAttribute('preload', 'auto');
    buzzerSound.addEventListener('canplaythrough', itemLoaded, false);

    good1Sound = document.createElement('audio');
    document.body.appendChild(good1Sound);
    good1Sound.setAttribute('src', `${folder}/sounds/good1.${soundFormat}`);
    good1Sound.setAttribute('type', `audio/${soundFormat}`);
    good1Sound.setAttribute('preload', 'auto');
    good1Sound.addEventListener('canplaythrough', itemLoaded, false);

    good2Sound = document.createElement('audio');
    document.body.appendChild(good2Sound);
    good2Sound.setAttribute('src', `${folder}/sounds/good2.${soundFormat}`);
    good2Sound.setAttribute('type', `audio/${soundFormat}`);
    good2Sound.setAttribute('preload', 'auto');
    good2Sound.addEventListener('canplaythrough', itemLoaded, false);

    boomSound = document.createElement('audio');
    document.body.appendChild(boomSound);
    boomSound.setAttribute('src', `${folder}/sounds/boom.${soundFormat}`);
    boomSound.setAttribute('type', `audio/${soundFormat}`);
    boomSound.setAttribute('preload', 'auto');
    boomSound.addEventListener('canplaythrough', itemLoaded, false);

    currentGameStateFunction = gameStateWaitForLoad;
  }

  function gameStateWait() {
    waitTime--;
    if (waitTime === 0) {
      currentGameStateFunction = nextGameState;
    }
  }

  function gameStateWaitForLoad() {
    context.fillStyle = '#ffcc88';
    context.font = '30px scoreboard';
  }

  function gameStateTitle() {
    if (!titleStarted) {
      context.drawImage(titleScreenImage, 0, 0);
      titleScreenSound.play();
      titleStarted = true;
    } else if (keyPressList[83]) {
      // s: start
      currentGameStateFunction = gameStateNewGame;
      titleScreenSound.pause();
      titleStarted = false;
    }
    if (titleScreenSound.currentTime > 6.3) {
      titleScreenSound.currentTime = 0;
    }
  }

  function gameStateNewGame() {
    context.drawImage(titleScreenStartImage, 0, 0);
    startSound.play();
    homeScore = 0;
    visitorScore = 0;
    good2Count = 0;
    period = 0;
    waitTime = 40 * 2;
    nextGameState = gameStateNewLevel;
    currentGameStateFunction = gameStateWait;
  }

  function gameStateNewLevel() {
    context.drawImage(backgroundImage, 0, 0);
    gameMusicSound.currentTime = 0;
    period++;
    clock = 59;
    player.x = 500;
    player.y = 550;
    good1.x = 300;
    good1.y = 0;
    good2.x = 500;
    good2.y = 0;
    ouch.x = 700;
    ouch.y = 0;
    periodSound.play();
    waitTime = 40 * 3;
    nextGameState = gameStatePlayLevel;
    currentGameStateFunction = gameStateWait;
  }

  function gameStatePlayLevel() {
    gameMusicSound.play();
    checkKeys();
    update();
    render();
    checkCollisions();
  }

  function gameStateGameOver() {
    if (homeScore > visitorScore) {
      context.drawImage(winImage, 250, 200);
    } else {
      context.drawImage(loseImage, 250, 200);
    }
    if (keyPressList[83]) {
      // s: start
      currentGameStateFunction = gameStateNewGame;
    }
  }

  function gameStatePaused() {
    if (keyPressList[82]) {
      // r: resume
      currentGameStateFunction = nextGameState;
      gameMusicSound.play();
    }
  }

  function checkKeys() {
    if (keyPressList[37] && stunTimer === 0) {
      // left arrow
      if (player.x > 220) {
        player.x -= 10;
      }
    }
    if (keyPressList[39] && stunTimer === 0) {
      // right arrow
      if (player.x < 700) {
        player.x += 10;
      }
    }
    if (keyPressList[80]) {
      // p: pause
      nextGameState = currentGameStateFunction;
      currentGameStateFunction = gameStatePaused;
      gameMusicSound.pause();
    }
  }

  let good1Count = 0;
  function checkCollisions() {
    if (boundingBoxCollide(player, good1)) {
      // play sound for good1
      good1Count++;
      if (good1Count === 5) {
        homeScore++;
        good1Sound.play();
        good1Count = 0;
      }
      good1.y = -100;
      good1.x = 220 + Math.floor(Math.random() * 500);
    }

    if (boundingBoxCollide(player, good2)) {
      good2Sound.currentTime = 0;
      good2Sound.play();
      good2.y = -100;
      good2.x = 220 + Math.floor(Math.random() * 500);
      good2Count++;
      if (good2Count === 6) {
        // play sound for getting 6 good2
        good2Count = 0;
      }
    }

    if (boundingBoxCollide(player, ouch)) {
      // play sound for ouch collision
      visitorScore++;
      boomSound.currentTime = 0;
      boomSound.play();
      stunTimer = frameRate / 2;
      ouch.y = -100;
      ouch.x = 220 + Math.floor(Math.random() * 500);
    }
  }

  function boundingBoxCollide(object1, object2) {
    const left1 = object1.x + 5;
    const left2 = object2.x + 5;
    const right1 = object1.x + object1.hitWidth - 5;
    const right2 = object2.x + object2.hitWidth - 5;
    const top1 = object1.y + 5;
    const top2 = object2.y + 5;
    const bottom1 = object1.y + object1.hitHeight - 5;
    const bottom2 = object2.y + object2.hitHeight - 5;

    if (bottom1 < top2) return false;
    if (top1 > bottom2) return false;

    if (right1 < left2) return false;
    if (left1 > right2) return false;

    return true;
  }

  function update() {
    if (good1.y < 1000) {
      good1.y = good1.y + 9 + period * 2;
    } else {
      good1.y = -100;
      good1.x = 220 + Math.floor(Math.random() * 500);
    }
    if (ouch.y < 1000) {
      ouch.y = ouch.y + 5 + period * 2;
    } else {
      ouch.y = -100;
      ouchSound.play();
      ouch.x = 220 + Math.floor(Math.random() * 500);
    }
    if (good2.y < 1000) {
      good2.y = good2.y + 3 + period * 2;
    } else {
      good2.y = -100;
      good2.x = 220 + Math.floor(Math.random() * 500);
    }

    if (stunTimer > 0) {
      stunTimer--;
    }

    secondFraction++;
    if (secondFraction === frameRate / 2) {
      secondFraction = 0;
      clock--;
      if (clock === 0) {
        gameMusicSound.pause();
        buzzerSound.play();
        if (period === 3) {
          currentGameStateFunction = gameStateGameOver;
        } else {
          currentGameStateFunction = gameStateNewLevel;
        }
      }
    }
  }

  function render() {
    context.drawImage(backgroundImage, 0, 0);

    if (stunTimer % 2 === 0) {
      context.drawImage(playerImage, player.x, player.y);
    } else {
      context.drawImage(playerHurtImage, player.x, player.y);
    }

    context.drawImage(good1Image, good1.x, good1.y);
    context.drawImage(good2Image, good2.x, good2.y);
    context.drawImage(ouchImage, ouch.x, ouch.y);
    context.fillStyle = '#ffcc88';
    context.font = '30px scoreboard';
    context.fillText(homeScore, 400, 740);
    context.fillText(visitorScore, 600, 740);
    context.fillText(period, 540, 765);
    if (clock < 10) {
      context.fillText(`00:0${clock}`, 470, 740);
    } else {
      context.fillText(`00:${clock}`, 470, 740);
    }
    context.font = '15px scoreboard';
    context.fillText(`good2s:${good2Count}`, 385, 760);
  }

  document.onkeydown = function (e) {
    e = e || window.event;
    keyPressList[e.keyCode] = true;
  };

  document.onkeyup = function (e) {
    e = e || window.event;
    keyPressList[e.keyCode] = false;
  };

  function runGame() {
    currentGameStateFunction();
  }

  // begin the game
  currentGameStateFunction = gameStateInit;
  const intervalTime = 1000 / frameRate;
  setInterval(runGame, intervalTime);
}

function showReady() {
  startButton.addEventListener('click', loadGame, false);
}

function loadGame() {
  startButton.removeEventListener('click', loadGame, false);
  document.querySelector('#start-container').style.display = 'none';
  document.querySelector('#game-container').style.display = 'block';
  const folder =
    (window.location.search && window.location.search.replace('?', '')) || '.';
  window.folder = folder;
  playCatch();
}

const startButton = document.querySelector('#start-button');
window.addEventListener('load', showReady, false);
