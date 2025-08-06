import { Component } from "ecs";
import Vec2D from "vector2d";

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
