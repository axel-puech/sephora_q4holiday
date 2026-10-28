//@input SceneObject parent
//@input SceneObject background

//@input Component.Text outroTime
//@input Component.Text outroScore

//@input SceneObject playAgain
//@input SceneObject share

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

let tapped = false;
//________Caller________//
//________Listener________//
//________DelayEvent________//

script.playAgain.getComponent("Component.InteractionComponent").onTouchStart.add(function () {
  if (tapped) return;
  tapped = true;
  fadeOutro.GoTo(0);
  fadeBackground.GoTo(1);
});

//_________________________Director_Functions_____________________//
function Start() {
  DisplayResults();
  fadeBackground.GoTo(0);
  fadeOutro.GoTo(1);
}
function OnLateStart() {}
function Update() {}
function Stop() {
  tapped = false;
  fadeBackground.JumpTo(1);
  fadeOutro.Reset();
}
//___________________________Functions__________________________//

function DisplayResults() {
  script.outroScore.text = "Score:\n" + global.GameManager._score;
  script.outroTime.text = FormatTime(global.GameManager._remainingTime) + " sec";
}

function FormatTime(timeInSeconds) {
  const seconds = timeInSeconds % 60;
  return Math.floor(timeInSeconds / 60) + ":" + (seconds < 10 ? "0" : "") + seconds;
}

//___________________________Animations_________________________//
const fadeBackground = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.background.getComponent("Component.Image").mainPass.alphaRatio = ratio;
});

const fadeOutro = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.playAgain.getComponent("Component.Image").mainPass.alphaRatio = ratio;
  script.share.getComponent("Component.Image").mainPass.alphaRatio = ratio;

  const color = script.outroTime.textFill.color;
  script.outroTime.textFill.color = new vec4(color.x, color.y, color.z, ratio);
  script.outroScore.textFill.color = new vec4(color.x, color.y, color.z, ratio);
});

fadeOutro.OnEnd = function (ratio) {
  if (ratio === 0) {
    script.subScene.CallEnd(null);
  }
};
