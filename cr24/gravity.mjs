import { Component } from "ecs";
import Vec2D from "vector2d";

class Gravity extends Component {
  static force = Vec2D;

  constructor (force) {
    super(Gravity, arguments);

    this.force = force;
  }
}

export { Gravity };
