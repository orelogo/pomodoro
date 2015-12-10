var workMillisec = 4000;             // time of pomodoro (work portion)
var breakMillisec = 2000;             // time of break

var pausedMillisec = workMillisec; // time remaining, used when paused
var countdownMillisec = pausedMillisec; // total countdown in milliseconds
var displayHour, displayMin, displaySec, displayMillisec;
var displayTime;                      // time in string format h:m:s.ms
var timer;                            // id for timer
var workInterval = true;     // true if work interval, false if break interval
var timerRunning = false;    // true if timer running, false if not

/**
 * Start the timer.
 */
function startTimer() {
  var startTime = Date.now();  // time at start of timer
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
function parseTotal() {
  var countdownRemaining;
  displayHour = Math.floor(countdownMillisec / 1000 / 60 / 60);
  countdownRemaining = countdownMillisec - (displayHour * 1000 * 60 * 60);
  displayMin = Math.floor(countdownRemaining / 1000 / 60);
  countdownRemaining -= displayMin * 1000 / 60;
  displaySec = Math.floor(countdownRemaining / 1000);
  countdownRemaining -= displaySec * 1000;
  displayMillisec = Math.floor(countdownRemaining);
}

/**
 * Print time to DOM.
 */
function printTime() {
  parseTotal();
  displayTime = ""; // time to be displayed
  if (displayHour > 0) // add hour column if necessary
    displayTime += displayHour + "h:";
  displayTime += displayMin + "m:" + displaySec + "s." + displayMillisec
    + "ms"
  $("#timer").text(displayTime);
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
  }
  else {
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
  parseTotal();
}

/**
 * Reset time to work beginning of work interval
 */
function resetTimerToWork() {
  clearInterval(timer);
  timerRunning = false; // timer stopped

  workInterval = true;  // reset to work interval
  // reset time for timer and for display
  countdownMillisec = pausedMillisec = workMillisec;
  $("#timer").css("color", "green");
  $("#timer-toggle").text("Start");
  printTime();
}

/**
 * Reset the timer to break beginning of break interval. Used in
 * breakIncrease() and breakDecrease() methds during a paused break interval.
 */
function resetTimerToBreak(interval) {
  clearInterval(timer);

  workInterval = false;  // reset to break interval
  // reset time for timer and for display
  countdownMillisec = pausedMillisec = breakMillisec;
  $("#timer").css("color", "red");
  printTime();
}

/**
 * Stop timer, switch between work/break interval and start a new timer.
 */
function switchInterval() {
  clearInterval(timer); // stop timer
  if (workInterval) {   // chage to break interval
    countdownMillisec = pausedMillisec = breakMillisec;
    workInterval = false;
    $("#timer").css("color", "red");
  }
  else { // change to work interval
    countdownMillisec = pausedMillisec = workMillisec;
    workInterval = true;
    $("#timer").css("color", "green");
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
  }
}

$(document).ready(function() {
  printTime();

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
