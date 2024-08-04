import { MAX_ENTITIES, Component, Signature, System, Coordinator } from "./modules/ECS.mjs";
import Vec2D from "./modules/Vector.mjs";
import { assert, integer, Color } from "./modules/Helper.mjs";
import { expect } from "./modules/Types.mjs";

class Gravity extends Component {
  force;

  constructor (force) {
    assert(force instanceof Vec2D).failWith(
      `Argument for "force" not of type "Vec2D"`
    );

    super();

    this.force = force;
  }
}

class RigidBody extends Component {
  velocity;
  acceleration;

  constructor (velocity, acceleration) {
    assert(
      expect([ velocity, acceleration ]).all(Vec2D)
    ).failWith(
      `Argument for "RigidBody#constructor" not of type "Vec2D": ${velocity}, ${acceleration}`
    );

    super();

    this.velocity = velocity;
    this.acceleration = acceleration;
  }
}

class Transform extends Component {
  position;
  rotation;
  scale;

  constructor (position, rotation, scale) {
    assert(
      expect([ position, rotation, scale ]).all(Vec2D)
    ).failWith(
      `Argument for "Transform#constructor" not of type "Vec2D": ${position}, ${rotation}, ${scale}`
    );


    super();

    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }
}

class Texture extends Component {
  color;

  constructor (color) {
    assert(color instanceof Color).failWith(
      `Argument for "color" not a valid fill style string, CanvasGradient, or CanvasPattern`
    );

    super();

    this.color = color;
  }
}



class Physics extends System {
  update (deltaTime) {
    this.entities.forEach(
      function (entityId) {
        const gravity = Coordinator.getComponent(entityId, Gravity),
              rigidBody = Coordinator.getComponent(entityId, RigidBody),
              transform = Coordinator.getComponent(entityId, Transform);

        transform.position = Vec2D.add(transform.position, Vec2D.scale(rigidBody.velocity, deltaTime));
        rigidBody.velocity = Vec2D.add(rigidBody.velocity, Vec2D.scale(gravity.force, deltaTime));

        if (transform.position.y > height) {
          transform.position = new Vec2D(transform.position.x, - height * Math.random());
          rigidBody.velocity = new Vec2D(0, Math.random() * 10);
        }
      }
    );
  }
}


const canvas = document.getElementById("ecs-canvas"),
      ctx = canvas.getContext("2d");

if (!ctx) {
  throw new Error("Something went wrong with the &lt;canvas&gt; element :/");
}

const { clientWidth : width, clientHeight : height } = document.documentElement;
[ canvas.width, canvas.height ] = [ width, height ];


class SquareRenderer extends System {
  draw (deltaTime) {
    this.entities.forEach(
      function (entityId) {
        const transform = Coordinator.getComponent(entityId, Transform),
              texture = Coordinator.getComponent(entityId, Texture);

        ctx.fillStyle = texture.color;

        const [ x, y ] = Vec2D.toArray(transform.position),
              [ w, h ] = Vec2D.toArray(transform.scale);


        ctx.fillRect(x, y, w, h);
      }
    );
  }
}


Coordinator.registerComponent(Gravity);
Coordinator.registerComponent(RigidBody);
Coordinator.registerComponent(Transform);
Coordinator.registerComponent(Texture);

const physicsSystem = Coordinator.registerSystem(Physics),

      physicsSignature = new Signature();

physicsSignature.set(Gravity.type);
physicsSignature.set(RigidBody.type);
physicsSignature.set(Transform.type);

Coordinator.setSystemSignature(Physics, physicsSignature);


const squareRendererSystem = Coordinator.registerSystem(SquareRenderer),

      squareRendererSignature = new Signature();

squareRendererSignature.set(Texture.type);

Coordinator.setSystemSignature(SquareRenderer, squareRendererSignature);


const entities = Array(MAX_ENTITIES).fill(0),

      zeroVector = new Vec2D(0, 0);

for (let i = 0; i < MAX_ENTITIES; ++i) {
  const entity = entities[i] = Coordinator.createEntity(),

        randomGravity = new Vec2D(0, Math.random() * 15),
        randomPosition = new Vec2D(Math.random() * width, Math.random() * -height - 10),
        randomRotation = new Vec2D(Math.random() * 200 - 100, Math.random() * 200 - 100),
        randomScale = Math.random() * 7 + 3,

        randomColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;


  Coordinator.addComponent(entity, new Gravity(randomGravity));
  Coordinator.addComponent(entity, new RigidBody(zeroVector, zeroVector));
  Coordinator.addComponent(entity, new Transform(randomPosition, randomRotation, new Vec2D(randomScale, randomScale)));
  Coordinator.addComponent(entity, new Texture(randomColor));
}


let deltaTime = 0,
    lastTick = performance.now();

function draw (time) {
  deltaTime = (time - lastTick) / 1000;
  lastTick = time;

  physicsSystem.update(deltaTime);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  squareRendererSystem.draw(deltaTime);

  window.requestAnimationFrame(draw);
}

window.requestAnimationFrame(draw);
