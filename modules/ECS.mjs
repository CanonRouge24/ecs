import { assert, integer } from "./Helper.mjs";


/**
 * @source https://austinmorlan.com/posts/entity_component_system/#the-entity
 * Check out his other blog posts — they definitely seem pretty interesting
 */


/**
 * Somewhat arbitrarily decided. Probably has very little impact on performance
 * in JavaScript. For that matter, I'm not sure it has any impact in C++ either.
 * The code enforces these requirements nevertheless. Tweak as needed.
 * TODO: Read in desired values from Options object, which in turn is configured
 * through a config file and/or running code?
 */
const MAX_ENTITIES = 1024,
      MAX_COMPONENT_TYPES = 8;


/**
 * Pseudo-type. Or really, just a typedef/alias for an integer in a particular
 * range [0, MAX_ENTITIES)
 *
 * Not meant to be instantiated
 */
class EntityID {
  /* ----- Static Methods ----- */
  static [Symbol.hasInstance] (value) {
    return integer(value).inRange(0, MAX_ENTITIES);
  }

  static {
    Object.freeze(EntityID);
    Object.freeze(EntityID.prototype);
  };


  constructor () {
    throw new Error(`Attempt to instantiate "EntityID"`);
  }
}


/**
 * Like EntityID, is a pseudo-type/typedef/alias for an integer in a particular
 * range [0, MAX_COMPONENT_TYPES)
 *
 * Not meant to be instantiated
 */
class ComponentType {
  /* ----- Static Methods ----- */
  static [Symbol.hasInstance] (value) {
    return integer(value).inRange(0, MAX_COMPONENT_TYPES);
  }

  static {
    Object.freeze(ComponentType);
    Object.freeze(ComponentType.prototype);
  };


  constructor () {
    throw new Error(`Attempt to instantiate "ComponentType"`);
  }
}


/**
 * Base class, marker class for all the `Component`s users will define
 * The public field `type` will be defined on all sub-classes when registered.
 * The `type` marks its place in signatures for entities and systems.
 */
class Component {
  // static type; // Assigned for instances by `ComponentManager.registerComponent`

  static {
    Object.freeze(Component);
    Object.freeze(Component.prototype);
  }


  constructor () {
    assert(new.target !== Component).failWith(
      `Attempt to instantiate raw Component base class`
    )?.interface;
  }
}


/* Array-like bitset. Makes use of JavaScript wizadry to "overload" value
 * operator unary minus (`-signature`) and by extension and operator
 * bitwise and (-(a & b) === -c).
 *
 * While you can set and reset bits using array square bracket notation,
 * there is no protection against setting the value to anything other
 * than the bitset's invariant 0 or 1. When that happens, the
 * signature-matching behavior is undefined. Using the class's API methods
 * on the offending bits will fix the issue, though.
 *
 * Class modeled after the C++ bitset
 * @source https://en.cppreference.com/w/cpp/utility/bitset/all_any_none
 */
class Signature extends Array {
  static {
    Object.freeze(Signature);
    Object.freeze(Signature.prototype);
  };


  constructor () {
    super();

    // Freeze signature array size
    Object.defineProperty(
      this,
      "length",
      {
        value: MAX_COMPONENT_TYPES,
        configurable: false,
        writable: false
      }
    );

    this.fill(0);
  }


  /* To be used with unary minus operator and equivalent `===` operator */
  [Symbol.toPrimitive] () {
    return BigInt(`0b${this.join``}`);
  }


  /* ----- Instance Methods ----- */
  // Is every bit set?
  all () {
    return this.every(e => e);
  }

  // Is at least one bit set?
  any () {
    return this.any(e => e);
  }

  // Is no bit set?
  none () {
    return this.every(e => !e);
  }

  // How many bits are set?
  count () {
    return this.reduce((accumulator, element) => accumulator + element, 0);
  }

  // How many bits are there total?
  size () {
    return MAX_COMPONENT_TYPES;
  }

  // Safer version of using array dereference square brackets to set the value
  set (index) {
    if (index instanceof ComponentType) {

      this[index] = 1;
      return;
    }

    // Else
    assert(index === undefined).failWith(
      `Argument for "index" not of type "ComponentType"`
    )?.interface;

    // Else, set all bits
    this.fill(1);
  }

  // Safer version of using array dereference square brackets to set the value
  reset (index) {
    if (index instanceof ComponentType) {
      this[index] = 0;
      return;
    }

    // Else
    assert(index === undefined).failWith(
      `Argument for "index" not of type "ComponentType"`
    )?.interface;

    // Else, reset all bits
    this.fill(0);
  }

  /* Did not use ^ XOR in order to ensure invalid values outside 0/1 are
   * instead mapped by parity
   */
  flip (index) {
    if (index instanceof ComponentType) {
      this[index] = (this[index] + 1) & 1;
      return;
    }

    // Else
    assert(index === undefined).failWith(
      `Argument for "index" not of type "ComponentType"`
    )?.interface;

    // Else flip all bits
    for (let i = 0; i < MAX_COMPONENT_TYPES; ++i) {
      this[i] = (this[i] + 1) & 1;
    }
  }
}


/**
 * Stores all available entity IDs, each entity's signature (whether alive or
 * not), and a count of how many entities are alive at any given time. Handles
 * the distribution and destruction of entity IDs.
 *
 * Not meant to be instantiated
 */
class EntityManager {
  /* ----- Static Properties ----- */
  // Stack of entity IDs
  static #availableEntities = Array(MAX_ENTITIES).fill(0);

  // Map from entityId to array index 1-to-1
  static #signatures = Array(MAX_ENTITIES).fill(null);

  static #livingEntityCount = 0;

  static {
    let availableEntities = this.#availableEntities,
        signatures = this.#signatures;

    /* Apparently a single imperative loop like this is faster than two
     * separate loops or using the array functional methods
     */
    for (let i = 0; i < MAX_ENTITIES; ++i) {
      // Put the stack in reverse so the smallest IDs are at the top
      availableEntities[i] = MAX_ENTITIES - (i + 1);
      signatures[i] = new Signature();
    }
  };

  static {
    Object.freeze(EntityManager);
    Object.freeze(EntityManager.prototype);
  };


  constructor () {
    throw new Error(`Attempt to instantiate "EntityManager"`);
  }


  /* ----- Static Methods ----- */
  static createEntity () {
    assert(this.#livingEntityCount instanceof EntityID).failWith(
      `Too many living entities`
    )?.interface;

    ++this.#livingEntityCount;
    return this.#availableEntities.pop();
  }

  // Hopefully duplicates are not passed in randomly
  static destroyEntity (entityId) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.temporary;

    this.#signatures[entityId].reset();
    this.#availableEntities.push(entityId);
    --this.#livingEntityCount;
  }

  static setSignature (entityId, signature) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.interface;

    assert(signature instanceof Signature).failWith(
      `Object ${signature} not an instance of Signature class`
    )?.interface;

    this.#signatures[entityId] = signature;
  }

  static getSignature (entityId) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.temporary;

    return this.#signatures[entityId];
  }
}


/**
 * Stores an array of MAX_ENTITIES components, all of the same type. Thus,
 * there is a `ComponentArray` for every `Component`. The components are
 * tightly packed, so as additions and removals occur it is likely to no
 * longer be in order. To rectify that problem, we keep a live map between
 * entity ID and index into the ComponentArray
 */
class ComponentArray {
  static {
    Object.freeze(ComponentArray);
    Object.freeze(ComponentArray.prototype);
  };


  /* ----- Instance Properties ----- */
  #components = Array(MAX_ENTITIES).fill(null);

  /* Object is close to twice as fast as Maps for insertion and deletion of
   * small integer keys (< 100,000). However, it suffers virtually the exact
   * same performance hit on iteration (half as fast as Maps)
   *
   * While creation and destruction of small integer entityId keys fits the
   * exact use case for Objects over Maps, I think optimizing for better
   * iteration is still the more important consideration since entities are
   * unlikely to require more insertion and deletion operations than iteration
   * operations at a given time
   *
   * (We need to use two separate maps since we map EntityID → EntityID, so
   * there's very high potential for collision)
   *
   * @source https://www.zhenghao.io/posts/object-vs-map
   * @source https://codesandbox.io/p/sandbox/still-glitter-yuu1dm
   * (both are made by the same person)
   */
  #entityToIndexMap = new Map();
  #indexToEntityMap = new Map();

  #size = 0;

  /* Provided by ComponentManager.registerComponent */
  #componentClass = null;
  #componentType = null;


  constructor (componentClass, componentType) {
    assert(componentClass?.prototype instanceof Component).failWith(
      `Argument for "componentClass" not of type "Component". Got: ${componentClass}`
    )?.temporary;

    assert(componentType instanceof ComponentType).failWith(
      `Argument for "componentType" not of type "ComponentType". Got: ${componentType}`
    )?.temporary;

    this.#componentClass = componentClass;
    this.#componentType = componentType;
  }


  /* ----- Instance Methods ----- */
  // insertComponent might have been a better name
  insertData (entityId, component) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.temporary;

    assert(component instanceof componentClass).failWith(
      `Argument for "component" not of type "${componentName}"`
    )?.temporary;

    // Cache values
    const componentClass = this.#componentClass,
          componentName = componentClass.name,
          entityToIndexMap = this.#entityToIndexMap;

    assert(!entityToIndexMap.has(entityId)).failWith(
      `"${componentName}" added to same entity more than once`
    )?.interface;

    const newIndex = this.#size;
    entityToIndexMap.set(entityId, newIndex);
    this.#indexToEntityMap.set(newIndex, entityId);
    this.#components[newIndex] = component;
    ++this.#size;
  }

  // removeComponent might have been a better name
  deleteData (entityId) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.temporary;

    // Cache values
    const componentName = this.#componentClass.name,
          entityToIndexMap = this.#entityToIndexMap,
          indexToEntityMap = this.#indexToEntityMap,
          components = this.#components;

    assert(entityToIndexMap.has(entityId)).failWith(
      `Removing non-existent "${componentName}"`
    )?.interface;

    // Replace removed entity's component with last component in list
    const removedEntityIndex = entityToIndexMap.get(entityId),
          lastIndex = this.#size - 1,

          lastEntity = indexToEntityMap.get(lastIndex);

    components[removedEntityIndex] = components[lastIndex];

    // Update entityToIndexMap and indexToEntityMap
    entityToIndexMap.set(lastEntity, removedEntityIndex);
    indexToEntityMap.set(removedEntityIndex, lastEntity);

    // Remove deleted entity and last index
    entityToIndexMap.delete(entityId);
    indexToEntityMap.delete(lastIndex);

    --this.#size;
  }

  // getComponent might have been a better name
  getData (entityId) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.interface;

    // Cache values
    const entityToIndexMap = this.#entityToIndexMap;

    assert(entityToIndexMap.has(entityId)).failWith(
      `Retrieving non-existent "${this.#componentClass.name}"`
    )?.interface;

    return this.#components[entityToIndexMap.get(entityId)];
  }

  // Receive message that an entity was destroyed, and remove corresponding Component if present
  entityDestroyed (entityId) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    );

    if (this.#entityToIndexMap.has(entityId)) {
      this.deleteData(entityId);
    }
  }
}


/**
 * Handles the registration of new `Component` classes and provides their
 * `type` field. Enforces the MAX_COMPONENT_TYPES restriction.
 * Provides a single unified interface for adding components of any types
 * to an entity.
 *
 * Not meant to be instantiated
 */
class ComponentManager {
  /* ----- Static Properties ----- */
  static #componentId = 0;

  static #componentArrays = new Map();

  static {
    Object.freeze(ComponentManager);
    Object.freeze(ComponentManager.prototype);
  };


  constructor () {
    throw new Error(`Attempt to instantiate "ComponentManager"`);
  }


  /* ----- Static Methods ----- */
  /**
   * Get the `ComponentArray` for a given Component sub-class or instance object
   * (either works)
   */
  static #getComponentArray (/* component(Class) */) {
    // Cache values
    let arg = arguments[0],
        componentArrays = this.#componentArrays;

    // Component instance passed in
    if (arg instanceof Component) {
      // Cache values
      const componentClass = arg.constructor,
            name = componentClass.name;

      assert(componentClass.type instanceof ComponentType).failWith(
        `Component type ${name} not registered before use`
      )?.interface;

      return componentArrays.get(arg.constructor);
    }

    // Component sub-class passed in
    if (arg?.prototype instanceof Component) {
      assert(arg.type instanceof ComponentType).failWith(
        `Component type ${arg.name} not registered before use`
      )?.interface;

      return componentArrays.get(arg);
    }

    // Else
    assert(false).failWith(
      `Argument not of type "Component" or subtype of "Component"`
    )?.interface;
  }

  // Provide `type` field to the class
  static registerComponent (componentClass) {
    // Assert arguments
    assert(componentClass?.prototype instanceof Component).failWith(
      `Argument for "component" not sub-class of "Component"`
    )?.temporary;

    // Cache values
    const name = componentClass.name,
          componentId = this.#componentId,
          componentArrays = this.#componentArrays;

    assert(componentId instanceof ComponentType).failWith(
      `Too many component types, can't register ${name} component`
    )?.interface;

    assert(!componentArrays.has(componentClass)).failWith(
      `Attempt to register ${name} component more than once`
    )?.interface;

    // Add new ComponentArray to the map
    componentClass.type = componentId;
    componentArrays.set(componentClass, new ComponentArray(componentClass, componentId));

    // Increment ComponentType for next registered component
    ++this.#componentId;
  }

  static addComponent (entityId, component) {
    // All the checks are done in `ComponentArray#insertData` and `ComponentManager.getComponentArray`
    (this.#getComponentArray(component)).insertData(entityId, component);
  }

  static deleteComponent (entityId, componentClass) {
    // All the checks are done in `ComponentArray#deleteData` and `ComponentManager.getComponentArray`
    (this.#getComponentArray(componentClass)).deleteData(entityId);
  }

  static getComponent (entityId, componentClass) {
    // All the checks are done in `ComponentArray#getData` and `ComponentManager.getComponentArray`
    return (this.#getComponentArray(componentClass)).getData(entityId);
  }

  // Receive message that an entity was destroyed, notify all `ComponentArray`s
  static entityDestroyed (entityId) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.temporary;

    this.#componentArrays.forEach(
      function (componentArray /*, componentClass */) {
        componentArray.entityDestroyed(entityId);
      }
    );
  }
}


/**
 * Base class for all the `System`s that users will define
 * Keeps a set of the entities that the system is interested in operating upon
 */
class System {
  static {
    Object.freeze(System);
    Object.freeze(System.prototype);
  };


  /* ----- Private Properties ----- */
  entities = new Set();


  constructor () {
    assert(new.target !== System).failWith(
      `Attempt to instantiate raw System base class`
    );
  }


  /* ----- Instance Methods ----- */
  // registerEntity might have been a better name
  insertData (entityId) {
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.temporary;

    this.entities.add(entityId);
  }

  // removeEntity might have been a better name
  deleteData (entityId) {
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.temporary;

    this.entities.delete(entityId);
  }

  // Receive message that an entity was destroyed, delete the entity if present
  entityDestroyed (entityId) {
    // All the necessary checks are done in `System#deleteData`
    this.deleteData(entityId);
  }
}


/**
 * Keeps track of each registered `System`'s signature, as well as the instance
 * of each `System` sub-class (Systems are not static sub-classes due to
 * requiring each to keep a set of operand entities)
 *
 * Not meant to be instantiated
 */
class SystemManager {
  /* ----- Static Properties ----- */
  // Map sub-class object to its instance
  static #systemToInstanceMap = new Map();

  // Map sub-class object to its signature
  static #systemToSignatureMap = new Map();

  static {
    Object.freeze(SystemManager);
    Object.freeze(SystemManager.prototype);
  };


  constructor () {
    throw new Error(`Attempt to instantiate "SystemManager"`);
  }


  /* ----- Static Methods ----- */
  static registerSystem (systemClass) {
    // Assert arguments
    assert(systemClass?.prototype instanceof System).failWith(
      `Argument for "systemClass" not sub-class of "System"`
    )?.temporary;

    // Cache value
    const systemToInstanceMap = this.#systemToInstanceMap;

    assert(!systemToInstanceMap.has(systemClass)).failWith(
      `Attempt to register system ${systemClass.name} more than once`
    )?.interface;

    const instance = Reflect.construct(systemClass, Array(0));

    systemToInstanceMap.set(systemClass, instance);
    this.#systemToSignatureMap.set(systemClass, null);

    return instance;
  }

  static setSignature (systemClass, signature) {
    // Assert arguments
    assert(systemClass?.prototype instanceof System).failWith(
      `Argument for "systemClass" not sub-class of "System"`
    )?.temporary;

    assert(signature instanceof Signature).failWith(
      `Argument for "signature" not of type "Signature"`
    )?.temporary;

    // Cache value
    const systemToSignatureMap = this.#systemToSignatureMap;

    assert(systemToSignatureMap.has(systemClass)).failWith(
      `Attempt to set signature for non-registered system ${systemClass.name}`
    )?.interface;

    systemToSignatureMap.set(systemClass, signature);
  }

  // Receive message that an entity was destroyed, notify every system
  static entityDestroyed (entityId) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.temporary;

    // Deletes the `entityId` from each `Set`, if it's present
    this.#systemToInstanceMap.forEach(
      function (instance, _systemClass) {
        instance.entityDestroyed(entityId);
      }
    );
  }

  /* Receive message that an entity has changed signatures, determine which
   * systems to notify with addition and which with removal
   */
  static entitySignatureChanged (entityId, entitySignature) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.temporary;

    assert(entitySignature instanceof Signature).failWith(
      `Argument for "signature" not of type "Signature"`
    )?.temporary;

    // Cache value
    const systemToInstanceMap = this.#systemToInstanceMap;

    this.#systemToSignatureMap.forEach(
      function (signature, systemClass) {
        const systemInstance = systemToInstanceMap.get(systemClass);

        // System's signature matches the entity's new signature
        if (-(entitySignature & signature) === -signature) {
          systemInstance.insertData(entityId);
        }
        // Doesn't match, remove entity from system
        else {
          systemInstance.deleteData(entityId);
        }
      }
    );
  }
}


/**
 * Single unified interface for the entire ECS, basically just a wrapper class
 * for all the methods so that you don't need to remember which methods are on
 * which classes.
 *
 * Not meant to be instantiated
 */
class Coordinator {
  /* ----- Static Properties ----- */
  static #entityManager = EntityManager;
  static #componentManager = ComponentManager;
  static #systemManager = SystemManager;

  static {
    Object.freeze(Coordinator);
    Object.freeze(Coordinator.prototype);
  };


  constructor () {
    throw new Error(`Attempt to instantiate "Coordinator" class`);
  }


  /* ----- Static Methods ----- */
  static createEntity () {
    return this.#entityManager.createEntity();
  }

  static destroyEntity (entityId) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.interface;

    this.#entityManager.destroyEntity(entityId);
    this.#componentManager.entityDestroyed(entityId);
    this.#systemManager.entityDestroyed(entityId);
  }

  static registerComponent (componentClass) {
    // Assert arguments
    assert(componentClass?.prototype instanceof Component).failWith(
      `Argument for "componentClass" not sub-class of "Component"`
    )?.interface;

    this.#componentManager.registerComponent(componentClass);
  }

  static addComponent (entityId, component) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.interface;

    assert(component instanceof Component).failWith(
      `Argument for "component" not of type "Component"`
    )?.interface;

    this.#componentManager.addComponent(entityId, component);

    // Update relevant systems to include the entity if needed
    const signature = this.#entityManager.getSignature(entityId);
    signature.set(component.constructor.type);
    // this.#entityManager.setSignature(entityId, signature); // Not necessary

    this.#systemManager.entitySignatureChanged(entityId, signature);
  }

  static deleteComponent (entityId, componentClass) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.interface;

    assert(componentClass?.prototype instanceof Component).failWith(
      `Argument for "componentClass" not sub-class of "Component"`
    )?.interface;

    // Delete component from ComponentArray
    this.#componentManager.deleteComponent(entityId, componentClass);

    // Remove component from signature
    const signature = this.#entityManager.getSignature(entityId);
    signature.set(componentClass.type);
    // this.#entityManager.setSignature(entityId, signature); // Not necessary

    // Notify systems of new entity signature
    this.#systemManager.entitySignatureChanged(entity, signature);
  }

  static getComponent (entityId, componentClass) {
    // Assert arguments
    assert(entityId instanceof EntityID).failWith(
      `Entity ID ${entityId} out of range`
    )?.interface;

    assert(componentClass?.prototype instanceof Component).failWith(
      `Argument for "componentClass" not sub-class of "Component"`
    )?.interface;

    return this.#componentManager.getComponent(entityId, componentClass);
  }

  static registerSystem (systemClass) {
    // Assert arguments
    assert(systemClass?.prototype instanceof System).failWith(
      `Argument for "systemClass" not sub-class of "System"`
    )?.interface;

    return this.#systemManager.registerSystem(systemClass);
  }

  static setSystemSignature (systemClass, signature) {
    // Assert arguments
    assert(systemClass?.prototype instanceof System).failWith(
      `Argument for "systemClass" not sub-class of "System"`
    )?.interface;

    assert(signature instanceof Signature).failWith(
      `Argument for "signature" not of type "Signature"`
    )?.interface;

    this.#systemManager.setSignature(systemClass, signature);
  }
}

export { MAX_ENTITIES, Component, Signature, System, Coordinator };
