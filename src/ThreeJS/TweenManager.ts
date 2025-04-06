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
  stopTween(tween: Tween) {
    const assocTween = this.group
      .getAll()
      .find((t) => tween.getId() == t.getId());
    if (assocTween) {
      assocTween.stop();
      this.group.remove(assocTween);
    }
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
