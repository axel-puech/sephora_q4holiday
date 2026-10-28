//@input SceneObject parent
//@input SceneObject[] squareParent
//@input Asset.Texture[] textures
//@input float delayBeforeStart
//@input float delayBeforeChangeScene

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

const squareArray = [];
const flipAnimationDuration = 0.5;

let gameRunning = false;
let enableInteraction = false;

let flip_1_square = null;
let flip_2_square = null;

//________Caller________//

const onMatchCaller = script.subScene.CreateCaller("OnMatchEvent");
const toggleExperienceCaller = script.subScene.CreateCaller("OnToggleExperience");

//________Listener________//

const gameEndListener = script.subScene.CreateListener("GameEndEvent", OnGameEndEvent);

//________DelayEvent________//

const beforeStartDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  toggleExperienceCaller.Call(true);
  gameRunning = true;
});

const flipSquareDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  flip_1_square.resetFlip();
  flip_2_square.resetFlip();
  ClearFlips();

  resetInteractionDelay.event.reset(flipAnimationDuration);
});

const resetInteractionDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  enableInteraction = true;
});

const matchSquareDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  flip_1_square._anims.scale.Start(1);
  flip_2_square._anims.scale.Start(1);
  ClearFlips();

  enableInteraction = true;
});

const changeSceneDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  script.subScene.CallEnd(null);
});

//_________________________Director_Functions_____________________//
function Start() {
  const pairs = global.GameManager.generatePair();

  squareArray.forEach((square, id) => {
    square.setPair(pairs[id], script.textures[pairs[id] - 1]);
    square.Reset();
    square._anims.fade.GoTo(1);
  });

  ClearFlips();
  enableInteraction = true;
}
function OnLateStart() {
  beforeStartDelay.event.reset(script.delayBeforeStart);
}
function Update() {}
function Stop() {
  gameRunning = false;
}
//___________________________Functions__________________________//

function OnGameEndEvent() {
  gameRunning = false;

  squareArray.forEach((square) => {
    square._anims.fade.GoTo(0);
  });
  changeSceneDelay.event.reset(script.delayBeforeChangeScene);
}

function onSquareTapped(squareTapped) {
  // premier flip
  if (flip_1_square === null) {
    flip_1_square = squareTapped;
    return;
  }

  // second flip
  flip_2_square = squareTapped;
  enableInteraction = false;

  if (flip_1_square._pairId === flip_2_square._pairId) {
    matchSquareDelay.event.reset(flipAnimationDuration);
    onMatchCaller.Call();
  } else {
    flipSquareDelay.event.reset(flipAnimationDuration);
  }
}

function ClearFlips() {
  flip_1_square = null;
  flip_2_square = null;
}

//___________________________Animations_________________________//

class Square {
  constructor(obj) {
    this._obj = obj;
    this._transform = this._obj.getTransform();
    this._pairId = null;
    this._status = "untapped";

    //___________________________Front__________________________//

    const frontObj = this.getChildByName("Front");

    const meshVisual_front = frontObj.getComponent("Component.RenderMeshVisual");
    this._material_front = meshVisual_front.mainMaterial.clone();
    meshVisual_front.mainMaterial = this._material_front;

    frontObj.getComponent("Component.InteractionComponent").onTap.add(this.onTap.bind(this));

    //___________________________Back__________________________//

    const backObj = this.getChildByName("Back");
    this._backObjTransform = backObj.getTransform();
    this._baseScale = this._backObjTransform.getLocalScale();

    const meshVisual = backObj.getComponent("Component.RenderMeshVisual");
    this._material = meshVisual.mainMaterial.clone();
    meshVisual.mainMaterial = this._material;

    this.initAnimations();
    this.Reset();
  }

  getChildByName(name) {
    const childCount = this._obj.getChildrenCount();

    for (let i = 0; i < childCount; i++) {
      const child = this._obj.getChild(i);
      if (child.name === name) {
        return child;
      }
    }

    return null;
  }

  initAnimations() {
    this._anims = {
      fade: new Animation(script.getSceneObject(), 0.5, (ratio) => {
        this._material_front.mainPass.alphaRatio = ratio;
        this._material.mainPass.alphaRatio = ratio;
      }),

      rotate: new Animation(script.getSceneObject(), flipAnimationDuration, (ratio) => {
        const angle = Math.PI * ratio;
        this._transform.setLocalRotation(quat.angleAxis(angle, vec3.up()));
      }),

      scale: new Animation(
        script.getSceneObject(),
        0.2,
        (ratio) => {
          const scaleMultiplier = 1 + ratio * 0.05;
          this._backObjTransform.setLocalScale(this._baseScale.uniformScale(scaleMultiplier));
        },
        RepeatMode.PingPong,
      ),
    };

    this._anims.rotate.OnEnd = this.OnFlipAnimEnd.bind(this);
    this._anims.scale.Easing = QuadraticInOut;
  }

  OnFlipAnimEnd(ratio) {
    if (ratio === 0) {
      this._status = "untapped";
    }
  }

  onTap() {
    if (!gameRunning || !enableInteraction) return;
    if (this._status === "untapped") {
      this._anims.rotate.GoTo(1);
      this._status = "tapped";
      onSquareTapped(this);
    }
  }

  resetFlip() {
    this._anims.rotate.GoTo(0);
  }

  setPair(pairId, texture) {
    this._pairId = pairId;
    this._material.mainPass.baseTex = texture;
  }

  Reset() {
    this._status = "untapped";
    this._anims.fade.Reset();
    this._anims.rotate.Reset();
    this._anims.scale.Reset();
  }
}

// les carrés sont créés une seule fois, Start ne fait que les remélanger
script.squareParent.forEach((element) => {
  squareArray.push(new Square(element));
});
