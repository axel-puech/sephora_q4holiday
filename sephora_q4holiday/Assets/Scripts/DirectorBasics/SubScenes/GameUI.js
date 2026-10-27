//@input SceneObject parent

//@input Component.Text textTime
//@input Component.Text textScore
//@input float endTimeValue

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

let gameStarted = false;
let timer = 0;
let points = 0;
const maxPoints = 12;

//________Caller________//

const timerEndCaller = script.subScene.CreateCaller("TimerEndEvent");
//________Listener________//
const onMatchListener = script.subScene.CreateListener("OnMatchEvent", OnMatchEvent);
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  points = 0;
  UpdateScore();
}
function OnLateStart() {}
function Update() {
  if (!gameStarted) return;
  UpdateTime();
}

function Stop() {
  gameStarted = false;
  timer = 0;
  points = 0;
}
//___________________________Functions__________________________//

function OnMatchEvent() {
  points = Math.min(points + 1, maxPoints);
  UpdateScore();
}

function UpdateScore() {
  script.textScore.text = points + "/" + maxPoints;
}

function UpdateTime() {
  timer += getDeltaTime();
  let timeToDisplay = Math.floor(timer);
  timeToDisplay = Math.ceil(script.endTimeValue - timer);

  script.textTime.text = FormatTime(timeToDisplay);

  if (timer >= script.endTimeValue) {
    timerEndCaller.Call();
  }
}

function FormatTime(timeInSeconds) {
  let totalSeconds = Math.max(0, Math.floor(timeInSeconds));
  let minutes = Math.floor(totalSeconds / 60);
  let seconds = totalSeconds % 60;
  let formattedMinutes = (minutes < 10 ? "0" : "") + minutes;
  let formattedSeconds = (seconds < 10 ? "0" : "") + seconds;
  return formattedMinutes + ":" + formattedSeconds;
}

//___________________________Animations_________________________//
