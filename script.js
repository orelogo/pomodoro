var workMillisec = 4000; // time of pomodoro (work portion)
var breakMillisec = 2000; // time of break

var pausedMillisec = workMillisec; // time remaining, used when paused
var countdownMillisec = pausedMillisec; // total countdown in milliseconds
var displayTimerHour, displayTimerMin, displayTimerSec, displayTimerMillisec;
var displayWorkHour, displayWorkMin, displayWorkSec;
var displayBreakHour, displayBreakMin, displayBreakSec
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
    printTime("timer");
  }, 25);
}

/**
 * Parse total millisecond countdown time to readable time.
 */
function parseTotal(what) {
  var countdownRemaining; // remain ms that will be divided into h/m/s

  if (what === "timer") {
    displayTimerHour = Math.floor(countdownMillisec / 1000 / 60 / 60);
    countdownRemaining = countdownMillisec - (displayTimerHour * 1000 * 60 *
      60);
    displayTimerMin = Math.floor(countdownRemaining / 1000 / 60);
    countdownRemaining -= displayTimerMin * 1000 * 60;
    displayTimerSec = Math.floor(countdownRemaining / 1000);
    countdownRemaining -= displayTimerSec * 1000;
    displayTimerMillisec = Math.floor(countdownRemaining);
  }

  if (what === "controls") {
    // change work display variables
    displayWorkHour = Math.floor(workMillisec / 1000 / 60 / 60);
    countdownRemaining = workMillisec - (displayWorkHour * 1000 * 60 *
      60);
    displayWorkMin = Math.floor(countdownRemaining / 1000 / 60);
    countdownRemaining -= displayWorkMin * 1000 * 60;
    displayWorkSec = Math.floor(countdownRemaining / 1000);
    countdownRemaining -= displayWorkSec * 1000;

    // change break display variables
    displayBreakHour = Math.floor(breakMillisec / 1000 / 60 / 60);
    countdownRemaining = breakMillisec - (displayBreakHour * 1000 * 60 *
      60);
    displayBreakMin = Math.floor(countdownRemaining / 1000 / 60);
    countdownRemaining -= displayBreakMin * 1000 / 60;
    displayBreakSec = Math.floor(countdownRemaining / 1000);
  }
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
function printTime(what) {

  if (what === "timer") {
    parseTotal("timer");
    updateProgressBarPercent();
    var displayTime = ""; // time to be displayed
    if (displayTimerHour > 0) // add hour column if necessary
      displayTime += displayTimerHour + "h:";
    displayTime += displayTimerMin + "m:" + displayTimerSec + "s." +
      displayTimerMillisec + "ms";
    $("#timer").text(displayTime);
    $("#timer-bar").css("width", progressBarPercent + "%");
  }

  if (what === "controls") {
    parseTotal("controls");
    var displayWork = "";
    if (displayWorkHour > 0) // add hour column if necessary
      displayWork += displayWorkHour + "h:";
    displayWork += displayWorkMin + "m:" + displayWorkSec + "s";
    $("#work-num").text(displayWork);

    var displayBreak = "";
    if (displayBreakHour > 0) // add hour column if necessary
      displayBreak += displayBreakHour + "h:";
    displayBreak += displayBreakMin + "m:" + displayBreakSec + "s";
    $("#break-num").text(displayBreak);
  }

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
 * Set countdown to 0. May not be necessary.
 */
function zeroTime() {
  countdownMillisec = 0;
  parseTotal("timer");
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
  $("#timer").css("color", "green");
  $("#timer-toggle").text("Start");
  printTime("timer");
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
  printTime("timer");
}

/**
 * Stop timer, switch between work/break interval and start a new timer.
 */
function switchInterval() {
  clearInterval(timer); // stop timer
  if (workInterval) { // chage to break interval
    countdownMillisec = pausedMillisec = breakMillisec;
    workInterval = false;
    $("#timer").css("color", "red");
    $("#timer-bar").addClass("progress-bar-info");
  } else { // change to work interval
    countdownMillisec = pausedMillisec = workMillisec;
    workInterval = true;
    $("#timer").css("color", "green");
    $("#timer-bar").removeClass("progress-bar-info");
  }
  startTimer(); // start new timer
}

/**
 * Increase work interval time. Can only change if timer isn't running.
 * If in the middle of a work interval, the interval will be reset with the
 * new time displayed.
 */
function workIncrease() {
  if (!timerRunning) {
    workMillisec += 1000;
    // if on break work, reset timer to work
    if (workInterval)
      resetTimerToWork();
    printTime("controls");
  }
}

/**
 * Decrease work interval time. Can only change if timer isn't running.
 * If in the middle of a work interval, the interval will be reset with the
 * new time displayed.
 */
function workDecrease() {
  if (!timerRunning) {
    workMillisec -= 1000;
    // work time cannot be less than 0
    if (workMillisec <= 0)
      workMillisec = 0;
    // if on work interval, reset timer to work
    if (workInterval)
      resetTimerToWork();
    printTime("controls");
  }
}

/**
 * Increase break interval time. Can only change if timer isn't running.
 * If in the middle of a break interval, the interval will be reset with the
 * new time displayed.
 */
function breakIncrease() {
  if (!timerRunning) {
    breakMillisec += 1000;
    // if on break interval, reset timer to break
    if (!workInterval)
      resetTimerToBreak();
    printTime("controls");
  }
}

/**
 * Decrease break interval time. Can only change if timer isn't running.
 * If in the middle of a break interval, the interval will be reset with the
 * new time displayed.
 */
function breakDecrease() {
  if (!timerRunning) {
    breakMillisec -= 1000;
    if (breakMillisec <= 0)
      breakMillisec = 0;
    // if on break interval, reset timer to break
    if (!workInterval)
      resetTimerToBreak();
    printTime("controls");
  }
}

$(document).ready(function() {
  printTime("timer");
  printTime("controls");

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
