//@input SceneObject parent
//@input SceneObject[] squareParent
//@input Asset.Texture[] textures

//_________________________Director Setup_________________________//
script.subScene = new global.SubScene(script, script.parent);
script.subScene.OnStart = Start;
script.subScene.OnLateStart = OnLateStart;
script.subScene.OnStop = Stop;
script.subScene.SetUpdate(Update);
//__________________________Variables_____________________________//

var squareArray = [];
const textureList = script.textures;

let enableInteraction = false;

let flip_1_id = null;
let flip_2_id = null;

let flip_1_square = null;
let flip_2_square = null;

const flipAnimationDuration = 0.5;

let pairFound = 0;

let number_pairs = 8;

//________Caller________//

const onMatchCaller = script.subScene.CreateCaller("OnMatchEvent");
//________Listener________//
//________DelayEvent________//

var flipSquareDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  flip_1_square.resetFlip();
  flip_2_square.resetFlip();

  flip_1_id = null;
  flip_2_id = null;

  flip_2_square = null;
  flip_1_square = null;

  resetInteractionDelay.event.reset(flipAnimationDuration);
});

var resetInteractionDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  enableInteraction = true;
});

var matchSquareDelay = script.subScene.CreateEvent("DelayedCallbackEvent", function () {
  flip_2_square._anims.scale.Start(1);
  flip_1_square._anims.scale.Start(1);

  flip_1_id = null;
  flip_2_id = null;

  flip_2_square = null;
  flip_1_square = null;
  enableInteraction = true;
});

//_________________________Director_Functions_____________________//
function Start() {
  script.squareParent.forEach((element, id) => {
    const pairId = global.GameManager._pairs[id];
    const texture = textureList[pairId - 1];
    const squareElem = new Square(element, id, pairId, texture);
    squareArray.push(squareElem);
  });
}
function OnLateStart() {
  enableInteraction = true;
}
function Update() {}
function Stop() {
  enableInteraction = false;

  flip_1_id = null;
  flip_2_id = null;

  flip_1_square = null;
  flip_2_square = null;

  pairFound = 0;
}
//___________________________Functions__________________________//

function onSquareTapped(squareTapped) {
  // si on fait le premier flip
  if (flip_1_id === null) {
    flip_1_square = squareTapped;
    flip_1_id = squareTapped._pairId;
  } else if (flip_2_id === null) {
    flip_2_square = squareTapped;
    flip_2_id = squareTapped._pairId;
    enableInteraction = false;

    if (flip_1_id === flip_2_id) {
      print("match");
      matchSquareDelay.event.reset(flipAnimationDuration);
      onMatchCaller.Call();
      pairFound += 1;
      print("pairFound" + pairFound);
      if (pairFound === number_pairs) {
        print("finish");
      }
    } else {
      flipSquareDelay.event.reset(flipAnimationDuration);
    }

    // petite animation de reset
  }
}

//___________________________Animations_________________________//

class Square {
  constructor(obj, id, pairId, texture) {
    // interaction
    // image
    // id
    // anim
    this._obj = obj;
    this._id = id;
    this._pairId = pairId;
    this._texture = texture;
    this._transform = this._obj.getTransform();
    this._baseScale = this._transform.getLocalScale();

    this._status = "untapped";

    //___________________________Front__________________________//

    this._frontObj = this.getChildByName("Front");
    this._interaction = this._frontObj.getComponent("Component.InteractionComponent");

    this._interaction.onTap.add(this.onTap.bind(this));

    //___________________________Back__________________________//

    this._backObj = this.getChildByName("Back");
    this._backObjTransform = this._backObj.getTransform();
    this._meshVisual = this._backObj.getComponent("Component.RenderMeshVisual");
    this._material = this._meshVisual.mainMaterial.clone();
    this._meshVisual.mainMaterial = this._material;
    this.setTexture(this._texture);

    this._anims = {
      fade: null,
      rotate: null,
      scale: null,
    };

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
    this._anims.fade = new Animation(script.getSceneObject(), 0.5, (ratio) => {
      this._material.mainPass.baseColor = new vec4(1, 1, 1, ratio);
    });

    this._anims.rotate = new Animation(script.getSceneObject(), flipAnimationDuration, (ratio) => {
      const angle = Math.PI * ratio;
      const rotationY = quat.angleAxis(angle, vec3.up());
      this._transform.setLocalRotation(rotationY);
    });
    this._anims.rotate.OnEnd = this.OnFlipAnimEnd.bind(this);

    this._anims.scale = new Animation(
      script.getSceneObject(),
      0.2,
      (ratio) => {
        const scaleMultiplier = 1 + ratio * 0.1;
        const animatedScale = this._baseScale.uniformScale(scaleMultiplier);

        this._backObjTransform.setLocalScale(animatedScale);
      },
      RepeatMode.PingPong,
    );

    this._anims.scale.Easing = QuadraticInOut;
  }

  OnFlipAnimEnd(ratio) {
    if (ratio === 0) {
      print("end flip anim");
      this._status = "untapped";
    }
  }

  onTap() {
    if (!enableInteraction) return;
    if (this._status === "untapped") {
      print("element tapped");
      this._anims.rotate.GoTo(1);
      this._status = "tapped";
      onSquareTapped(this);
    }
  }

  resetFlip() {
    this._anims.rotate.GoTo(0);
  }

  setTexture(tex) {
    this._material.mainPass.baseTex = tex;
  }

  Reset() {
    this._anims.fade.Reset();
    this._anims.fade.JumpTo(1);

    this._anims.rotate.Reset();
    this._anims.scale.Reset();
  }
}
