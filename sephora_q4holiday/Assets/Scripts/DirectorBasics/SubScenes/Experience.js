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

//________Caller________//
//________Listener________//
//________DelayEvent________//

//_________________________Director_Functions_____________________//
function Start() {
  script.squareParent.forEach((element, id) => {
    const pairId = global.GameManager._pairs[id];
    const texture = textureList[pairId - 1];
    const squareElem = new Square(element, id, texture);
  });
}
function OnLateStart() {}
function Update() {}
function Stop() {}
//___________________________Functions__________________________//

//___________________________Animations_________________________//

class Square {
  constructor(obj, id, texture) {
    // interaction
    // image
    // id
    // anim
    this._obj = obj;
    this._id = id;
    this._texture = texture;
    this._transform = this._obj.getTransform();

    this._status = "untapped";

    //___________________________Front__________________________//

    this._frontObj = this.getChildByName("Front");
    this._interaction = this._frontObj.getComponent("Component.InteractionComponent");

    this._interaction.onTap.add(this.onTap.bind(this));

    //___________________________Back__________________________//

    this._backObj = this.getChildByName("Back");
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

    this._anims.rotate = new Animation(script.getSceneObject(), 0.5, (ratio) => {
      const angle = Math.PI * ratio;
      const rotationY = quat.angleAxis(angle, vec3.up());
      this._transform.setLocalRotation(rotationY);
    });
  }

  onTap() {
    if (this._status === "untapped") {
      print("element tapped");
      this._anims.rotate.GoTo(1);
      this._status = "tapped";
    } else {
      this._anims.rotate.GoTo(0);
      this._status = "untapped";
    }
  }

  reset() {
    this._anims.rotate.GoTo(0);
    this._status = "untapped";
  }

  setTexture(tex) {
    this._material.mainPass.baseTex = tex;
  }

  Reset() {
    this._anims.fade.Reset();
    this._anims.fade.JumpTo(1);

    this._anims.rotate.Reset();
  }
}
