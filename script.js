let player;
let lyricsLines = [];
let currentLine = 0;

function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    events: {
      'onReady': onPlayerReady
    }
  });
}

function onPlayerReady(event) {
  // Placeholder
}

async function loadSong() {
  const artist = document.getElementById('artist').value;
  const title = document.getElementById('title').value;
  document.getElementById('lyrics').innerHTML = '';
  document.getElementById('geniusFrame').style.display = 'none';

  const response = await fetch(`https://add-backend-b7y6.onrender.com/api/lyrics?artist=${encodeURIComponent(artist)}&title=${encodeURIComponent(title)}`);
  const data = await response.json();

  if (data.lyrics) {
    lyricsLines = data.lyrics.split('\n').filter(line => line.trim());
    searchAndPlaySong(`${artist} ${title}`);
  } else if (data.redirect) {
    document.getElementById('geniusFrame').src = data.redirect;
    document.getElementById('geniusFrame').style.display = 'block';
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
      }
    });
}

function syncLyrics() {
  currentLine = 0;
  const totalDuration = 180;
  const interval = Math.max(totalDuration / lyricsLines.length, 2);

  const display = () => {
    if (currentLine >= lyricsLines.length) return;
    const line = lyricsLines[currentLine];
    const words = line.split(' ').map(word => `<div class="element">${word}</div>`).join('');
    document.getElementById('lyrics').innerHTML = words;
    currentLine++;
    setTimeout(display, interval * 1000);
  };

  display();
}
