var workMilliSec = 20000;             // time of pomodoro (work portion)
var countdownTotal = workMilliSec;    // stores total countdown in milliseconds
var remainingMilliSec = workMilliSec; // time remaining, used when paused
var countdownHour, countdownMin, countdownSec, countdownMilli;
var displayTime;                      // time in string format h:m:s.ms
var timer;                            // store id for timer

/* Run the timer */
function runTimer() {
  var startTime = Date.now();  // time at start of timer
  timer = setInterval(function() {
    countdownTotal = Math.round(remainingMilliSec - (Date.now() - startTime));
    if (countdownTotal <= 0) { // stop timer if countdown reaches 0
      clearInterval(timer);
      zeroTime();
    }
    printTime();
  }, 25);
}

/* Parse total millisecond countdown time to readable time */
function parseTotal() {
  var countdownRemaining;
  countdownHour = Math.floor(countdownTotal / 1000 / 60 / 60);
  countdownRemaining = countdownTotal - (countdownHour * 1000 * 60 * 60);
  countdownMin = Math.floor(countdownRemaining / 1000 / 60);
  countdownRemaining -= countdownMin * 1000 / 60;
  countdownSec = Math.floor(countdownRemaining / 1000);
  countdownRemaining -= countdownSec * 1000;
  countdownMilli = Math.floor(countdownRemaining);
}

/* Print time to screen */
function printTime() {
  parseTotal();
  displayTime = ""; // time to be displayed
  if (countdownHour > 0) // add hour column if necessary
    displayTime += countdownHour + "h:";
  displayTime += countdownMin + "m:" + countdownSec + "s." + countdownMilli
    + "ms"
  $(".timer").text(displayTime);
}

/* Ensure countdown is zero */
function zeroTime() {
  countdownTotal = 0;
  parseTotal();
}

/* Pause timer */
function pauseTimer() {
  clearInterval(timer);
  timer = undefined;
  remainingMilliSec = countdownTotal; // store remaining time
}

function resetTimer() {
  clearInterval(timer);
  timer = undefined;
  // reset time for timer and for display
  remainingMilliSec = countdownTotal = workMilliSec;
  printTime();
  $("#timer-control").text("Start");
}

$(document).ready(function() {
  printTime();

  // start/pause button
  $("#timer-control").click(function() {
    if (timer === undefined) {
      runTimer();
      $(this).text("Pause");
    } else {
      pauseTimer();
      $(this).text("Start");
    }
  });

  // reset button
  $("#timer-reset").click(resetTimer);

});
