//@input SceneObject parent

//@input Component.Text textTime
//@input Component.Text textScore
//@input float endTimeValue
//@input SceneObject userFlow

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
const toggleExperienceListener = script.subScene.CreateListener("OnToggleExperience", OnToggleExperience);

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

  fadeGameUI.Reset();
  fadeGameUI.JumpTo(1);
}

//___________________________Functions__________________________//

function OnToggleExperience(status) {
  gameStarted = status;
}

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
    fadeGameUI.GoTo(0);
    gameStarted = false;
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
const fadeGameUI = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.userFlow.getComponent("Component.Image").mainPass.baseColor = new vec4(1, 1, 1, ratio);

  const color = script.textTime.textFill.color;
  script.textTime.textFill.color = new vec4(color.x, color.y, color.z, ratio);
  script.textScore.textFill.color = new vec4(color.x, color.y, color.z, ratio);
});
