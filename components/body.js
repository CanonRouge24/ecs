import { Component } from "../modules/ECS.mjs";
import Vec2D from "../modules/Vector.mjs";

class Body extends Component {
  static velocity = Vec2D;
  static acceleration = Vec2D;

  constructor (velocity, acceleration) {
    super(Body, arguments);

    this.velocity = velocity;
    this.acceleration = acceleration;
  }
}

export { Body };
