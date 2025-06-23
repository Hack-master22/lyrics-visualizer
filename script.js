let player;
let lyricsLines = [];
let currentLine = 0;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    events: {
      'onReady': event => {
        // autoplay when ready
        player.playVideo();
      }
    }
  });
}


async function loadSong() {
  const artist = document.getElementById('artist').value;
  const title = document.getElementById('title').value;

  document.getElementById('lyrics').innerHTML = '';
  document.getElementById('geniusFrame').style.display = 'none';

  try {
    const response = await fetch(`https://add-backend-b7y6.onrender.com/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);

    if (response.status === 302) {
      const data = await response.json();
      document.getElementById('geniusFrame').src = data.redirect;
      document.getElementById('geniusFrame').style.display = 'block';
      return;
    }

    const data = await response.json();
    if (data.lyrics) {
      lyricsLines = data.lyrics.split('\n').filter(line => line.trim());
      searchAndPlaySong(`${artist} ${title}`);
    } else {
      document.getElementById('lyrics').innerText = 'Lyrics not found.';
    }
  } catch (err) {
    console.error('Error loading song:', err);
    document.getElementById('lyrics').innerText = 'Error fetching lyrics.';
  }
}

function searchAndPlaySong(query) {
  fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=AIzaSyA2yfwqbMdvsKeu6cCHRUs-vbswtjqi4Co&type=video&videoEmbeddable=true`)
    .then(res => res.json())
    .then(data => {
      const videoId = data.items[0]?.id?.videoId;
      if (videoId) {
        player.loadVideoById(videoId);
        syncLyrics();
      } else {
        document.getElementById('lyrics').innerText = 'No playable video found.';
      }
    })
    .catch(() => {
      document.getElementById('lyrics').innerText = 'Failed to load video.';
    });
}

function syncLyrics() {
  currentLine = 0;
  const totalDuration = player.getDuration() || 180;
  const interval = Math.max(totalDuration / lyricsLines.length, 2);

  const display = () => {
    if (currentLine >= lyricsLines.length) return;
    const line = lyricsLines[currentLine];
    const words = line.split(' ').map(word => `<div class="element">${word}</div>`).join(' ');
    const lyricsContainer = document.getElementById('lyrics');

    lyricsContainer.classList.remove('fade');
    void lyricsContainer.offsetWidth; // trigger reflow
    lyricsContainer.innerHTML = words;
    lyricsContainer.classList.add('fade');

    currentLine++;
    setTimeout(display, interval * 1000);
  };

  display();
}
