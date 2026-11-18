(() => {
  'use strict';
  const byId = id => document.getElementById(id);
  const film = byId('film'), stage = byId('stage'), welcome = byId('welcome');
  const start = byId('start'), playback = byId('playback'), togglePlay = byId('togglePlay');
  const framing = byId('framing'), sound = byId('sound'), timeline = byId('timeline');
  const details = byId('details'), next = byId('continue');
  const mediaRoot = '../swathi-arun-immersive-hd/assets/';
  const sources = {
    wide: {film: 'royal-film-enhanced-1080p.mp4', poster: 'poster-wide.jpg'},
    portrait: {film: 'royal-film-immersive-HD.mp4?v=ai-sr-20261119', poster: 'poster-portrait.jpg?v=ai-sr-20261119'}
  };
  const desktop = matchMedia('(min-width: 800px)');
  const scenes = [
    [0, 'An invitation unfolds'], [2.1, 'The palace awaits'], [10.15, 'Swathi & Arun'],
    [20, 'A royal celebration'], [29.65, 'Save the date'], [33.79, 'A royal finale']
  ];
  let hasStarted = false, hasCompleted = false, sourceRevision = 0, toastTimer;
  const clock = seconds => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  const duration = () => Number.isFinite(film.duration) ? film.duration : 39.213;

  function updateTimeline() {
    const current = film.currentTime;
    timeline.max = duration();
    timeline.value = current;
    timeline.setAttribute('aria-valuetext', `${Math.round(current)} seconds of ${Math.round(duration())} seconds`);
    byId('elapsed').textContent = clock(current);
    byId('total').textContent = clock(duration());
    byId('scene').textContent = scenes.filter(([at]) => at <= current).at(-1)[1];
  }
  function updatePlayButton() {
    togglePlay.textContent = hasCompleted && film.ended ? 'Replay' : film.paused ? 'Resume' : 'Pause';
    togglePlay.setAttribute('aria-label', film.ended ? 'Replay film' : film.paused ? 'Resume film' : 'Pause film');
  }
  function unlockCard() {
    hasCompleted = true;
    details.hidden = false;
    next.hidden = false;
    document.body.classList.remove('locked');
    byId('playbackStatus').textContent = 'Invitation complete';
    updatePlayButton();
  }
  function showPlaying() {
    hasStarted = true;
    start.disabled = false;
    welcome.classList.add('dismissed');
    welcome.inert = true;
    welcome.setAttribute('aria-hidden', 'true');
    playback.hidden = false;
    byId('playbackStatus').textContent = '';
    updatePlayButton();
  }
  async function play() {
    if (film.error) film.load();
    start.disabled = true;
    if (!hasStarted) byId('openingStatus').textContent = 'Opening your invitation…';
    try {
      await film.play();
      if (document.activeElement === start) togglePlay.focus({preventScroll: true});
    } catch (error) {
      if (error.name !== 'AbortError') {
        const message = 'Playback could not start. Tap Play to try again.';
        byId('openingStatus').textContent = message;
        byId('playbackStatus').textContent = 'Tap Resume to try again.';
      }
    } finally {
      start.disabled = false;
      updatePlayButton();
    }
  }
  function setSource() {
    const mode = framing.value === 'auto' ? (desktop.matches ? 'wide' : 'portrait') : framing.value;
    if (stage.dataset.framing === mode && film.getAttribute('src')) return;
    const position = film.currentTime;
    const wasPlaying = hasStarted && !film.paused;
    const revision = ++sourceRevision;
    film.pause();
    stage.dataset.framing = mode;
    film.poster = mediaRoot + sources[mode].poster;
    film.src = mediaRoot + sources[mode].film;
    film.addEventListener('loadedmetadata', () => {
      if (revision !== sourceRevision) return;
      film.currentTime = Math.min(position, duration() - 0.05);
      updateTimeline();
    }, {once: true});
    film.load();
    if (wasPlaying) play();
  }
  function replay() {
    film.currentTime = 0;
    hasCompleted = false;
    next.hidden = true;
    window.scrollTo({top: 0, behavior: 'instant'});
    details.hidden = true;
    document.body.classList.add('locked');
    play();
  }
  start.addEventListener('click', play);
  togglePlay.addEventListener('click', () => {
    if (film.ended) replay();
    else if (film.paused) play();
    else film.pause();
  });
  sound.addEventListener('click', () => {
    film.muted = !film.muted;
    sound.textContent = film.muted ? 'Sound off' : 'Sound on';
    sound.setAttribute('aria-label', film.muted ? 'Unmute sound' : 'Mute sound');
    sound.setAttribute('aria-pressed', String(film.muted));
  });
  timeline.addEventListener('input', () => {
    film.currentTime = Math.min(Number(timeline.value), duration());
    updateTimeline();
  });
  film.addEventListener('playing', showPlaying);
  film.addEventListener('pause', updatePlayButton);
  film.addEventListener('timeupdate', updateTimeline);
  film.addEventListener('durationchange', updateTimeline);
  film.addEventListener('ended', unlockCard);
  film.addEventListener('waiting', () => {
    if (hasStarted) byId('playbackStatus').textContent = 'Loading film…';
  });
  film.addEventListener('error', () => {
    start.disabled = false;
    byId('openingStatus').textContent = 'The film could not load. Check your connection and tap Play to retry.';
    byId('playbackStatus').textContent = 'Film unavailable. Tap Resume to retry.';
  });
  framing.addEventListener('change', setSource);
  desktop.addEventListener('change', () => { if (framing.value === 'auto') setSource(); });
  byId('replay').addEventListener('click', replay);

  function toast(message) {
    clearTimeout(toastTimer);
    byId('toast').textContent = message;
    byId('toast').classList.add('visible');
    toastTimer = setTimeout(() => byId('toast').classList.remove('visible'), 3000);
  }
  byId('calendar').addEventListener('click', () => {
    const calendar = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Swathi and Arun//Wedding Invitation//EN',
      'BEGIN:VEVENT', 'UID:swathi-arun-wedding-20271111@example.invalid', 'DTSTAMP:20261119T000000Z',
      'DTSTART;VALUE=DATE:20271111', 'DTEND;VALUE=DATE:20271112', 'SUMMARY:Swathi & Arun Wedding',
      'LOCATION:Chennai', 'DESCRIPTION:Ceremony time and venue to be confirmed.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
    const url = URL.createObjectURL(new Blob([calendar], {type: 'text/calendar;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url; link.download = 'Swathi-and-Arun-Wedding.ics';
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 6000);
    toast('Date saved as a calendar file');
  });
  byId('share').addEventListener('click', async () => {
    try {
      const invitation = {title: 'Swathi & Arun Wedding', text: '11 November 2027 · Chennai', url: location.href};
      if (navigator.share) await navigator.share(invitation);
      else if (navigator.clipboard) { await navigator.clipboard.writeText(invitation.url); toast('Invitation link copied'); }
      else toast('Copy this page’s address to share your invitation.');
    } catch (error) {
      if (error.name !== 'AbortError') toast('Sharing unavailable. Copy this page’s address instead.');
    }
  });
  setSource();
})();
