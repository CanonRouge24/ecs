import { Component } from "ecs";
import { Color } from "helper";

class Texture extends Component {
  static color = Color;

  constructor (color) {
    super(Texture, arguments);

    this.color = color;
  }
}

export { Texture };
