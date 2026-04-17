// ===============================
// GLOBAL STATE
// ===============================

let isPlaying = false;
let isPaused = false;
let currentAudio = null;
let currentIndex = 0;

const playBtn = document.getElementById('playAll');
const letters = document.querySelectorAll('.pronunciation-box span');


// ===============================
// INDIVIDUAL LETTER SOUND
// ===============================
document.querySelectorAll('.pronunciation-box span').forEach(letter => {
  letter.addEventListener('click', () => {

    // Stop any current audio
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    const sound = letter.dataset.sound;
    currentAudio = new Audio(`./sounds/${sound}.mp3`);
   
    letter.classList.add("active");

    currentAudio.play().catch(err => console.log(err));

    currentAudio.onended = () => {
      letter.classList.remove("active");
    };

  });
});

// ===============================
// PLAY / PAUSE BUTTON
// ===============================
playBtn.addEventListener('click', async () => {

  // ▶️ START PLAYING
  if (!isPlaying) {
    isPlaying = true;
    isPaused = false;
    playBtn.innerText = "⏸ Pause";

    for (let i = currentIndex; i < letters.length; i++) {

      currentIndex = i;

      // Pause check
      if (isPaused) return;

      let letter = letters[i];
      letter.classList.add("active");

      const sound = letter.dataset.sound;
      currentAudio = new Audio(`./sounds/${sound}.mp3`);

      try {
        await currentAudio.play();
      } catch (err) {
        console.log(err);
      }

      await new Promise(resolve => {
        currentAudio.onended = resolve;
      });

      letter.classList.remove("active");
    }

    // Reset after complete
    isPlaying = false;
    currentIndex = 0;
    playBtn.innerText = "🔊 Play All";
  }

  // ⏸ PAUSE
  else if (isPlaying && !isPaused) {
    isPaused = true;
    playBtn.innerText = "▶️ Resume";

    if (currentAudio) {
      currentAudio.pause();
    }
  }

  // ▶️ RESUME
  else if (isPaused) {
    isPaused = false;
    playBtn.innerText = "⏸ Pause";

    if (currentAudio) {
      try {
        await currentAudio.play();
      } catch (err) {
        console.log(err);
      }
    }
  }

});

