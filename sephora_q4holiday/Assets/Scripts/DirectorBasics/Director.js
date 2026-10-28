//@input SceneObject subSceneParent
//@input bool useFrontBack = true;

var director = null;

script.createEvent("OnStartEvent").bind(OnStart);

function OnStart() {
  director = new global.Director(script, script.subSceneParent, script.useFrontBack, OnSceneEnded);
}

function OnSceneEnded(sceneName, params) {
  switch (sceneName) {
    case "Experience":
      director.GoToScene("Outro", false, false);
      break;
    case "Outro":
      director.GoToScene("Experience", false, false);
      break;
  }
}
