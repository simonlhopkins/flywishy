import { Group, Tween } from "@tweenjs/tween.js";

class TweenManager {
  group = new Group();
  constructor() {}

  add(tween: Tween) {
    this.group.add(tween);
    tween.start();
  }
  pause() {
    this.group.getAll().forEach((tween) => {
      tween.pause();
    });
  }
  resume() {
    this.group.getAll().forEach((tween) => {
      tween.resume();
    });
  }
  update() {
    this.group.update();
  }
}

export default TweenManager;
