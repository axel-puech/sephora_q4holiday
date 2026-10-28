//@input SceneObject parent

//@input Component.Text textTime
//@input Component.Text textScore
//@input float endTimeValue
//@input SceneObject userFlow
//@input float gameCompleteDelay

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

//________Caller________//

const gameEndCaller = script.subScene.CreateCaller("GameEndEvent");

//________Listener________//
const onMatchListener = script.subScene.CreateListener("OnMatchEvent", OnMatchEvent);
const toggleExperienceListener = script.subScene.CreateListener("OnToggleExperience", OnToggleExperience);

//________DelayEvent________//

const gameCompleteDelay = script.subScene.CreateEvent("DelayedCallbackEvent", EndGame);

//_________________________Director_Functions_____________________//
function Start() {
  timer = 0;
  points = 0;
  UpdateScore();
  UpdateTime();
}
function OnLateStart() {}
function Update() {
  if (!gameStarted) return;

  timer += getDeltaTime();
  UpdateTime();

  if (timer >= script.endTimeValue) {
    EndGame();
  }
}

function Stop() {
  gameStarted = false;
  fadeGameUI.JumpTo(1);
}

//___________________________Functions__________________________//

function OnToggleExperience(status) {
  gameStarted = status;
}

function OnMatchEvent() {
  points += 1;
  UpdateScore();

  if (points >= global.GameManager.getPairNumber()) {
    // on fige le chrono, petit délai avant de passer à l'outro
    gameStarted = false;
    gameCompleteDelay.event.reset(script.gameCompleteDelay);
  }
}

function EndGame() {
  gameStarted = false;

  global.GameManager._score = points;
  global.GameManager._remainingTime = Math.max(0, Math.ceil(script.endTimeValue - timer));

  gameEndCaller.Call();
  fadeGameUI.GoTo(0);
}

function UpdateScore() {
  script.textScore.text = points + "/" + global.GameManager.getPairNumber();
}

function UpdateTime() {
  script.textTime.text = FormatTime(Math.ceil(script.endTimeValue - timer));
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
