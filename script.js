var workMillisec = 25 * 60 * 1000; // time of work interval (in millisec)
var breakMillisec = 5 * 60 * 1000; // time of break interval (in millisec)

var pausedMillisec = workMillisec; // time remaining, used when paused
var countdownMillisec = pausedMillisec; // total countdown in milliseconds
var displayTimerHour, displayTimerMin, displayTimerSec, displayTimerMillisec;
var displayWorkMin, displayBreakMin; // min displayed in control section
var progressBarPercent // percentage of progress bar to display
var timer; // id for timer
var workInterval = true; // true if work interval, false if break interval
var timerRunning = false; // true if timer running, false if not

/**
 * Start the timer.
 */
function startTimer() {
  var startTime = Date.now(); // time at start of timer
  timer = setInterval(function() {
    countdownMillisec = Math.round(
      pausedMillisec - (Date.now() - startTime));
    if (countdownMillisec <= 0) { // stop timer if countdown reaches 0
      switchInterval();
    }
    printTime();
  }, 25);
}

/**
 * Parse total millisecond countdown time to readable time.
 */
function parseTime() {
  var countdownRemaining; // remain ms that will be divided into h/m/s
  displayTimerHour = Math.floor(countdownMillisec / 1000 / 60 / 60);
  countdownRemaining = countdownMillisec - (displayTimerHour * 1000 * 60 *
    60);
  displayTimerMin = Math.floor(countdownRemaining / 1000 / 60);
  countdownRemaining -= displayTimerMin * 1000 * 60;
  displayTimerSec = Math.floor(countdownRemaining / 1000);
  countdownRemaining -= displayTimerSec * 1000;
  displayTimerMillisec = Math.floor(countdownRemaining);

}

/**
 * Update the progress bar percentage.
 */
function updateProgressBarPercent() {
  if (workInterval) {
    progressBarPercent = (workMillisec - countdownMillisec) / workMillisec *
      100;
  } else {
    progressBarPercent = 100 - ((breakMillisec - countdownMillisec) /
      breakMillisec * 100);
  }

}

/**
 * Print time to DOM.
 */
function printTime() {
  parseTime();
  updateProgressBarPercent();

  var displayTime = ""; // time to be displayed
  if (displayTimerHour > 0) // add hour column if necessary
    displayTime += displayTimerHour + "h:";
  if (displayTimerMin > 0) // add min column if necessary
    displayTime += displayTimerMin + "m:";
  if ((displayTimerSec + "").length < 2)
    displayTime += 0; // add leading zero to min if necessary
  displayTime += displayTimerSec + "s.";
  if ((displayTimerMillisec + "").length < 3)
    displayTime += 0; // add leading zero to miilisec if necessary
  if ((displayTimerMillisec + "").length < 2)
    displayTime += 0; // add another leading zero to millisec id necessary
  displayTime += displayTimerMillisec + "ms";

  $("#timer").text(displayTime);
  $("#timer-bar").css("width", progressBarPercent + "%");
}

/**
 * Print the minute values of work and break times.
 */
function printControls() {
  displayBreakMin = Math.floor(breakMillisec / 1000 / 60);
  displayWorkMin = Math.floor(workMillisec / 1000 / 60);
  $("#work-num").text(displayWorkMin);
  $("#break-num").text(displayBreakMin);
}

/**
 * Pause timer.
 */
function pauseTimer() {
  clearInterval(timer);
  pausedMillisec = countdownMillisec; // store remaining time
}

/**
 * Toggle between pause and unpause timer.
 */
function toggleTimer() {
  if (timerRunning) {
    pauseTimer();
    $("#timer-toggle").text("Start");
    timerRunning = false;
  } else {
    startTimer();
    $("#timer-toggle").text("Pause");
    timerRunning = true;
  }
}

/**
 * Reset time to work beginning of work interval
 */
function resetTimerToWork() {
  clearInterval(timer);
  timerRunning = false; // timer stopped

  workInterval = true; // reset to work interval
  // reset time for timer and for display
  countdownMillisec = pausedMillisec = workMillisec;
  $("#timer").css("color", "5cb85c");
  $("#timer-toggle").text("Start");
  printTime();
}

/**
 * Reset the timer to break beginning of break interval. Used in
 * breakIncrease() and breakDecrease() methds during a paused break interval.
 */
function resetTimerToBreak(interval) {
  clearInterval(timer);

  workInterval = false; // reset to break interval
  // reset time for timer and for display
  countdownMillisec = pausedMillisec = breakMillisec;
  printTime();
}

/**
 * Stop timer, switch between work/break interval and start a new timer. Plays
 * audio bell.
 */
function switchInterval() {
  clearInterval(timer); // stop timer
  if (workInterval) { // chage to break interval
    countdownMillisec = pausedMillisec = breakMillisec;
    workInterval = false;
    $("#timer").css("color", "#5bc0de");
    $("#timer-bar").addClass("progress-bar-info");
  } else { // change to work interval
    countdownMillisec = pausedMillisec = workMillisec;
    workInterval = true;
    $("#timer").css("color", "5cb85c");
    $("#timer-bar").removeClass("progress-bar-info");
  }
  document.getElementById("timer-bell").play(); // play bell sound
  startTimer(); // start new timer
}

/**
 * Increase work interval time. Can only change if timer isn't running.
 * If in the middle of a work interval, the interval will be reset with the
 * new time displayed.
 */
function workIncrease() {
  if (!timerRunning) {
    workMillisec += 60000;
    // if on break work, reset timer to work
    if (workInterval)
      resetTimerToWork();
    printControls();
  }
}

/**
 * Decrease work interval time. Can only change if timer isn't running.
 * If in the middle of a work interval, the interval will be reset with the
 * new time displayed.
 */
function workDecrease() {
  if (!timerRunning) {
    workMillisec -= 60000;
    // work time cannot be less than 0
    if (workMillisec <= 0)
      workMillisec = 0;
    // if on work interval, reset timer to work
    if (workInterval)
      resetTimerToWork();
    printControls();
  }
}

/**
 * Increase break interval time. Can only change if timer isn't running.
 * If in the middle of a break interval, the interval will be reset with the
 * new time displayed.
 */
function breakIncrease() {
  if (!timerRunning) {
    breakMillisec += 60000;
    // if on break interval, reset timer to break
    if (!workInterval)
      resetTimerToBreak();
    printControls();
  }
}

/**
 * Decrease break interval time. Can only change if timer isn't running.
 * If in the middle of a break interval, the interval will be reset with the
 * new time displayed.
 */
function breakDecrease() {
  if (!timerRunning) {
    breakMillisec -= 60000;
    if (breakMillisec <= 0)
      breakMillisec = 0;
    // if on break interval, reset timer to break
    if (!workInterval)
      resetTimerToBreak();
    printControls();
  }
}

$(document).ready(function() {
  printTime();
  printControls();

  // start/pause button
  $("#timer-toggle").click(toggleTimer);
  // reset button
  $("#timer-reset").click(resetTimerToWork);

  // interval control buttons
  $("#work-increase").click(workIncrease);
  $("#work-decrease").click(workDecrease);
  $("#break-increase").click(breakIncrease);
  $("#break-decrease").click(breakDecrease);
});
