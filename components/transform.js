import { Component } from "ecs";
import Vec2D from "vector2d";

class Transform extends Component {
  static position = Vec2D;
  static rotation = Vec2D;
  static scale = Vec2D;

  constructor (position, rotation, scale) {
    super(Transform, arguments);

    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }
}

export { Transform };
