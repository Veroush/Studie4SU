'use strict';

window.StateLoader = (function () {
  const STICKMAN_CONFUSED_FRAMES = [
    'img/stickman-confused1.svg',
    'img/stickman-confused2.svg',
    'img/stickman-confused3.svg',
    'img/stickman-confused4.svg',
  ];

  const CHASER_FRAMES = [
    'img/chasing-1.svg',
    'img/chasing-2.svg',
    'img/chasing-3.svg',
    'img/chasing-4.svg',
    'img/chasing-5.svg',
    'img/chasing-6.svg',
  ];

  const RUNNER_FRAMES = [
    'img/running-1.svg',
    'img/running-2.svg',
    'img/running-3.svg',
    'img/running-4.svg',
    'img/running-5.svg',
    'img/running-6.svg',
  ];

  function stop(timerRef) {
    if (!timerRef || !timerRef.id) return;
    clearInterval(timerRef.id);
    timerRef.id = null;
  }

  function start(timerRef, ids = {}) {
    const stickman = document.getElementById(ids.stickman || 'state-stickman');
    const chaser = document.getElementById(ids.chaser || 'state-chaser');
    const runner = document.getElementById(ids.runner || 'state-runner');

    stop(timerRef);

    if (stickman) {
      let currentFrame = 1;
      stickman.src = STICKMAN_CONFUSED_FRAMES[currentFrame];
      timerRef.id = window.setInterval(() => {
        currentFrame = (currentFrame + 1) % STICKMAN_CONFUSED_FRAMES.length;
        stickman.src = STICKMAN_CONFUSED_FRAMES[currentFrame];
      }, 400);
      return;
    }

    if (!chaser || !runner) return;

    let chaserFrame = 1;
    let runnerFrame = 1;

    chaser.src = CHASER_FRAMES[chaserFrame];
    runner.src = RUNNER_FRAMES[runnerFrame];

    timerRef.id = window.setInterval(() => {
      chaserFrame = (chaserFrame + 1) % CHASER_FRAMES.length;
      runnerFrame = (runnerFrame + 1) % RUNNER_FRAMES.length;
      chaser.src = CHASER_FRAMES[chaserFrame];
      runner.src = RUNNER_FRAMES[runnerFrame];
    }, 150);
  }

  return { start, stop };
})();
