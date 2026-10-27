//@input SceneObject parent
//@input SceneObject background

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//
//________Caller________//
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  print("outro start");
  fadeBackground.GoTo(0);
}
function OnLateStart() {}
function Update() {}
function Stop() {
  fadeBackground.Reset();
  fadeBackground.JumpTo(1);
}
//___________________________Functions__________________________//

//___________________________Animations_________________________//
const fadeBackground = new Animation(script.getSceneObject(), 0.5, (ratio) => {
  script.background.getComponent("Component.Image").mainPass.alphaRatio = ratio;
});
