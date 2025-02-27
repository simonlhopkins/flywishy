import { Group, Tween } from "@tweenjs/tween.js";

class TweenManager {
  group = new Group();
  constructor() {}

  add(tween: Tween) {
    this.group.add(tween);
    tween.start();
  }
  update() {
    this.group.update();
  }
}

export default TweenManager;
