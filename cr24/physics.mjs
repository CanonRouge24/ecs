import { System, Coordinator } from "ecs";

import { Transform } from "./components/transform.js";
import { Body } from "./components/body.js";
import { Gravity } from "./cr24/gravity.js";


class Physics extends System
