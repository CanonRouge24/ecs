import { MAX_ENTITIES, Component, Signature, System, Coordinator } from "ecs";
import Vec2D from "vector2d";

console.log("IMPORT.META.RESOLVE('ecs'): " + import.meta.resolve("ecs"));

// Import standard components
import { Transform } from "./components/transform.js";
import { Body } from "./components/body.js";
import { Gravity } from "./cr24/gravity.js";
import { Texture } from "./cr24/texture.js";




class Physics extends System {
  static components = [ Transform, Body, Gravity ];

  update (ctx, deltaTime) {
    this.entities.forEach(
      function (entityId) {
        const gravity = Coordinator.getComponent(entityId, Gravity),
              rigidBody = Coordinator.getComponent(entityId, Body),
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


class Canvas {
  static #width;
  static #height;

  static initialize (width, height) {
    this.#width = width;
    this.#height = height;
  }
}

const { clientWidth, clientHeight} = document.documentElement;
const width = 2 * clientWidth, height = 2 * clientHeight;


class SquareRenderer extends System {
  draw (ctx, deltaTime) {
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
Coordinator.registerComponent(Body);
Coordinator.registerComponent(Transform);
Coordinator.registerComponent(Texture);

const physicsSystem = Coordinator.registerSystem(Physics),

      physicsSignature = new Signature();

physicsSignature.set(Gravity.type);
physicsSignature.set(Body.type);
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
        randomScale = Math.random() * 14 + 6,

        randomColor = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`;


  Coordinator.addComponent(entity, new Gravity(randomGravity));
  Coordinator.addComponent(entity, new Body(zeroVector, zeroVector));
  Coordinator.addComponent(entity, new Transform(randomPosition, randomRotation, new Vec2D(randomScale, randomScale)));
  Coordinator.addComponent(entity, new Texture(randomColor));
}


let deltaTime = 0,
    lastTick = performance.now();

let boundDraw;

function draw (ctx, time) {
  deltaTime = (time - lastTick) / 1000;
  lastTick = time;

  physicsSystem.update(ctx, deltaTime);

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, width, height);

  squareRendererSystem.draw(ctx, deltaTime);

  window.requestAnimationFrame(boundDraw);
}

export default function initializeDraw (canvas, ctx) {
  [ canvas.width, canvas.height ] = [ width, height ];

  return (boundDraw = draw.bind(null, ctx));
}
