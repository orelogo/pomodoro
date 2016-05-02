var workMillisec = 25 * 60 * 1000; // time of work interval (in millisec)
var breakMillisec = 5 * 60 * 1000; // time of break interval (in millisec)

var pausedMillisec = workMillisec; // time remaining, used when paused
var countdownMillisec = pausedMillisec; // total countdown in milliseconds
var displayTimerHour, displayTimerMin, displayTimerSec, displayTimerMillisec;
var displayWorkMin, displayBreakMin; // min displayed in control section
var progressBarPercent; // percentage of progress bar to display
var timer; // id for timer
var isWorkInterval = true; // true if work interval, false if break interval
var isTimerRunning = false; // true if timer running, false if not
var elapsedWorkIntervals = 0; // how many work intervals have elapsed

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
  if (isWorkInterval) {
    progressBarPercent = (workMillisec - countdownMillisec) / workMillisec *
      100;
  }
  else {
    progressBarPercent = 100 - ((breakMillisec - countdownMillisec) /
      breakMillisec * 100);
  }
  if (isNaN(progressBarPercent)) {
    progressBarPercent = 0;
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
  $("#elapsed-work-intervals").text("Pomodoros completed: " +
      elapsedWorkIntervals);
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
  if (isTimerRunning) {
    pauseTimer();
    $("#timer-toggle").text("Start");
    isTimerRunning = false;
  } else {
    startTimer();
    $("#timer-toggle").text("Pause");
    isTimerRunning = true;
  }
}

/**
 * Reset the current timer interval.
 */
function resetInterval() {
  clearInterval(timer);
  $("#timer-toggle").text("Start");
  isTimerRunning = false;

  if (isWorkInterval) {
    countdownMillisec = pausedMillisec = workMillisec;
  }
  else {
    countdownMillisec = pausedMillisec = breakMillisec;
  }
  printTime();
}

/**
 * Completely reset the timer.
 */
function resetTimer() {
  clearInterval(timer);
  isTimerRunning = false; // timer stopped

  isWorkInterval = true; // reset to work interval
  elapsedWorkIntervals = 0; // reset elapsed work intervals
  // reset time for timer and for display
  countdownMillisec = pausedMillisec = workMillisec;
  $("#timer").css("color", "#5cb85c");
  $("#timer-bar").removeClass("progress-bar-info");
  $("#timer-toggle").text("Start");
  printTime();
}

/**
 * Reset the timer to break beginning of break interval. Used in
 * breakIncrease() and breakDecrease() methods during a paused break interval.
 */
function resetTimerToBreak(interval) {
  clearInterval(timer);

  isWorkInterval = false; // reset to break interval
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
  if (isWorkInterval) { // chage to break interval
    elapsedWorkIntervals += 1;
    countdownMillisec = pausedMillisec = breakMillisec;
    isWorkInterval = false;
    $("#timer").css("color", "#5bc0de");
    $("#timer-bar").addClass("progress-bar-info");
  } else { // change to work interval
    countdownMillisec = pausedMillisec = workMillisec;
    isWorkInterval = true;
    $("#timer").css("color", "#5cb85c");
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
  if (!isTimerRunning) {
    workMillisec += 60000;
    resetInterval();
    printControls();
  }
}

/**
 * Decrease work interval time. Can only change if timer isn't running.
 * If in the middle of a work interval, the interval will be reset with the
 * new time displayed.
 */
function workDecrease() {
  if (!isTimerRunning) {
    workMillisec -= 60000;
    // work time cannot be less than 0
    if (workMillisec <= 0)
      workMillisec = 0;
    // if on work interval, reset timer to work
    resetInterval();
    printControls();
  }
}

/**
 * Increase break interval time. Can only change if timer isn't running.
 * If in the middle of a break interval, the interval will be reset with the
 * new time displayed.
 */
function breakIncrease() {
  if (!isTimerRunning) {
    breakMillisec += 60000;
    resetInterval();
    printControls();
  }
}

/**
 * Decrease break interval time. Can only change if timer isn't running.
 * If in the middle of a break interval, the interval will be reset with the
 * new time displayed.
 */
function breakDecrease() {
  if (!isTimerRunning) {
    breakMillisec -= 60000;
    if (breakMillisec <= 0)
      breakMillisec = 0;
    resetInterval();
    printControls();
  }
}

$(document).ready(function() {
  printTime();
  printControls();


  $("#timer-toggle").click(toggleTimer); // start/pause button
  $("#timer-reset-interval").click(resetInterval); // reset interval button
  $("#timer-reset").click(resetTimer); // reset button

  // interval control buttons
  $("#work-increase").click(workIncrease);
  $("#work-decrease").click(workDecrease);
  $("#break-increase").click(breakIncrease);
  $("#break-decrease").click(breakDecrease);
});
