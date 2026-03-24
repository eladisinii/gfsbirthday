function nextScene(num) {
  document.querySelectorAll('.scene').forEach(s => s.classList.remove('active'));

  const target = document.getElementById('scene' + num);
  if (!target) return;

  target.classList.add('active');

  if (num === 2) {
    resetMaze();
    drawMaze();
  }

  if (num === 3) {
    startWordGame();
  }
}

function nextGame() {
  // tutup popup
  const popup = document.getElementById('popup');
  popup.style.display = 'none';

  // kasih delay dikit biar ga bentrok render
  setTimeout(() => {
    nextScene(3);
  }, 100);
}

const mazeLayout = [
  ['S','','W','','','',''],
  ['W','','W','','W','W',''],
  ['','','','','','',''],
  ['','W','W','','W','','W'],
  ['','','','','W','',''],
  ['W','','W','','','',''],
  ['','','','','W','','G']
];

let playerPos = {x: 0, y: 0};
let animating = false;

function resetMaze() {
  playerPos = {x: 0, y: 0};
  document.getElementById('status').innerText = '';
}

function drawMaze() {
  const maze = document.getElementById('maze');
  if (!maze) return;

  maze.innerHTML = '';

  mazeLayout.forEach((row, y) => {
    row.forEach((cell, x) => {
      const div = document.createElement('div');
      div.classList.add('cell');

      // klik + efek
      div.onclick = () => {
        div.style.transform = "scale(0.9)";
        setTimeout(() => div.style.transform = "", 100);
        handleClick(x, y);
      };

      if (cell === 'W') {
        div.classList.add('wall');
      } else if (cell === 'G') {
        div.classList.add('goal');
        div.innerText = '🤍';
      }

      if (playerPos.x === x && playerPos.y === y) {
        div.classList.add('player');
        div.innerText = '🩷';
      }

      maze.appendChild(div);
    });
  });
}

// klik lebih gampang (auto arah)
function handleClick(x, y) {
  const dx = x - playerPos.x;
  const dy = y - playerPos.y;

  let primary, secondary;

  // tentuin arah utama & cadangan
  if (Math.abs(dx) > Math.abs(dy)) {
    primary = [dx > 0 ? 1 : -1, 0];
    secondary = [0, dy > 0 ? 1 : -1];
  } else {
    primary = [0, dy > 0 ? 1 : -1];
    secondary = [dx > 0 ? 1 : -1, 0];
  }

  // coba arah utama dulu
  if (canMove(primary[0], primary[1])) {
    move(primary[0], primary[1]);
  }
  // kalau gagal, coba arah lain
  else if (canMove(secondary[0], secondary[1])) {
    move(secondary[0], secondary[1]);
  }
}

function canMove(dx, dy) {
  const newX = playerPos.x + dx;
  const newY = playerPos.y + dy;

  if (
    newX < 0 || newY < 0 ||
    newX >= 7 || newY >= 7 ||
    mazeLayout[newY][newX] === 'W'
  ) return false;

  return true;
}

// gerak smooth
function move(dx, dy) {
  if (animating) return;

  const newX = playerPos.x + dx;
  const newY = playerPos.y + dy;

  if (
    newX < 0 || newY < 0 ||
    newX >= 7 || newY >= 7 ||
    mazeLayout[newY][newX] === 'W'
  ) return;

  animating = true;

  setTimeout(() => {
    playerPos = {x: newX, y: newY};

    if (mazeLayout[newY][newX] === 'G') {
  showPopup(); // 🔥 munculin popup
}

    drawMaze();
    animating = false;
  }, 120);
}

// keyboard (optional, buat PC)
document.addEventListener('keydown', (e) => {
  if (!document.getElementById('scene2').classList.contains('active')) return;

  if (e.key === 'ArrowUp') move(0,-1);
  if (e.key === 'ArrowDown') move(0,1);
  if (e.key === 'ArrowLeft') move(-1,0);
  if (e.key === 'ArrowRight') move(1,0);
});

function showPopup() {
  const popup = document.getElementById('popup');
  popup.style.display = 'flex';

  launchConfetti(); // 🔥 ini yang bikin hujan confetti
}

// kata-kata
const goodWords = [
  "kind", "cute", "strong", "soft", "loving", "gentle", "sweet"
];

const badWords = [
  "useless", "annoying", "unlovable", "boring", "worthless"
];

let selectedWords = [];
let selectedGood = 0;
const REQUIRED = 5;

function startWordGame() {
  const box = document.getElementById('wordBox');
  const response = document.getElementById('response');
  const nextBtn = document.getElementById('nextBtn');

  box.innerHTML = '';
  response.innerText = '';
  nextBtn.style.display = 'none';
  nextBtn.disabled = true;
  selectedGood = 0;
  selectedWords = [];

  // ambil 5 good + 5 bad, randomize
  const allWords = [...goodWords.slice(0,5), ...badWords.slice(0,5)]
    .sort(() => Math.random() - 0.5);

  allWords.forEach(word => {
    const div = document.createElement('div');
    div.className = 'word'; 
    div.innerText = word;

    if (goodWords.includes(word)) {
      div.classList.add('good');

      div.onclick = () => {
        // toggle pilihan goodword
        if (div.classList.contains('selected')) {
          div.classList.remove('selected');
          selectedGood--;
          selectedWords = selectedWords.filter(w => w !== word);
        } else {
          div.classList.add('selected');
          selectedGood++;
          selectedWords.push(word);
        }

        // update response
        if (selectedGood === 0) {
          response.innerText = '';
        } else {
          response.innerText = "ril itumah";
        }

        // cek apakah sudah cukup good words
        if (selectedGood === REQUIRED) {
          nextBtn.style.display = 'inline-block';
          nextBtn.disabled = false;
          response.innerText = "ya yaaa!";
        } else {
          nextBtn.style.display = 'none';
          nextBtn.disabled = true;
        }
      };

    } else {
      div.classList.add('bad');

      div.onclick = () => {
        // badword bisa dipilih tapi ga ngaruh ke next button
        if (div.classList.contains('selected')) {
          div.classList.remove('selected');
        } else {
          div.classList.add('selected');
        }

        response.innerText = "kloi ku ga gitu😡🤬";
      };
    }

    box.appendChild(div);
  });
}

// tombol skip
function skipGame() {
  const activeScene = document.querySelector('.scene.active');
  if (!activeScene) return;

  if (activeScene.id === 'scene2') {
    // skip maze → langsung popup
    playerPos = {x:6, y:6}; // langsung ke goal
    drawMaze();
    showPopup();
  } else if (activeScene.id === 'scene3') {
    // skip word game → langsung scene4
    selectedWords = ["kind","cute","strong","soft","loving"];
    selectedGood = REQUIRED;
    nextScene(4);
  } else {
    // default skip ke scene berikutnya
    const nextNum = parseInt(activeScene.id.replace('scene','')) + 1;
    nextScene(nextNum);
  }
}
// continue dari popup maze → scene 3
function nextGame() {
  const popup = document.getElementById('popup');
  popup.style.display = 'none';
  setTimeout(() => nextScene(3), 100);
}

// tombol skip di semua scene
function skipGame() {
  const current = document.querySelector('.scene.active');
  if (current.id === "scene2") {
    // skip maze → langsung ke word game
    nextScene(3);
  } else if (current.id === "scene3") {
    // skip word game → langsung ke scene 4
    nextScene(4);
  } else if (current.id === "scene4") {
    // skip memories → langsung ke scene 5
    nextScene(5);
  }
}

function startScene5() {
  const container = document.getElementById('wordsContainer');
  const paragraphs = Array.from(container.querySelectorAll('p'));
  const nextBtn = document.getElementById('nextBtn');

  nextBtn.style.display = 'none'; // sembunyiin tombol dulu

  let pIndex = 0;

  function typeParagraph() {
    const p = paragraphs[pIndex];
    const text = p.dataset.text || ""; // ambil teks dari data-text
    p.innerText = ''; // kosongin dulu

    let i = 0;
    const interval = setInterval(() => {
      p.innerText += text[i];
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        pIndex++;
        if (pIndex < paragraphs.length) {
          setTimeout(typeParagraph, 200); // delay antar paragraf
        } else {
          nextBtn.style.display = 'inline-block'; // munculin tombol setelah selesai
        }
      }
    }, 15); // kecepatan ngetik
  }

  typeParagraph();
                                         }
    
