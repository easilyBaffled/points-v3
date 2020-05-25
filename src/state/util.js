import { useDispatch } from "react-redux";
import produce from "immer";

/**
 * Flatten deep and complex if/ternary operations
 * @param {Object.<boolean, function>} obj
 * @return {*}
 */
export const match = (obj) => obj[true]();

const payloadUnpacker = (payload) =>
  match({
    true: () => payload,
    [payload.length === 0]: () => undefined,
    [payload.length === 1]: () => payload[0],
  });

/**
 * Convert Actors - state updating functions used by the reducer - into redux action functions
 * by using the actor name as the action `type`.
 * @param {Object.<string, function>} updaters
 * @return {Object.<string, function(...[*]=): {payload: ...[*]=, type: string}>}
 */
export const createActions = (updaters) =>
  Object.keys(updaters).reduce(
    (acc, type) => ({
      ...acc,
      [type]: (...payload) => ({
        type,
        payload: payloadUnpacker(payload),
      }),
    }),
    {}
  );

/**
 *
 * @param {Object.<string, function(...[*]=, T): T >} actors
 * @param {T} initialState
 * @return {function(T, { type: string, payload: ...[*]= }): T}
 */
export const createReducer = (actors, initialState) => (
  state = initialState,
  { type, id, payload } = {}
) => {
  try {
    return type in actors
      ? produce(state, (draftState) => actors[type](payload, draftState, id))
      : state;
  } catch (e) {
    const data = {
      type,
      action: actors[type],
      payload,
    };

    console.log(typeof actors[type], { payload, state });
    e.message = `${JSON.stringify(data, null, 4)}
    ${e.message}`;

    throw e;
  }
};

export const withId = (actionObject, id) => ({ ...actionObject, id });

export const useEntityDispatch = (entityId) => {
  const dispatch = useDispatch();
  return (action) => {
    dispatch(withId(action, entityId));
  };
};

export const transform = (func, deriveKey = (v) => v) => (acc, val) => {
  if (typeof deriveKey !== "function")
    throw new TypeError(
      `deriveKey must be a function or \`undefined\`. Did you mean to pass ${deriveKey} to reduce?`
    );
  acc[deriveKey(val, acc)] = func(val, acc);
  return acc;
};

export function isPrimitive(arg) {
  const type = typeof arg;
  return type !== "object" && type !== "function";
}

export const not = (bool) => !bool;

/*
 * Action: { type: string, payload: any, id?: string }
 * Actor: ( payload: any, state: T, id: string ) => 'T
 * Reducer: ( state: object, action: Action ) => 'state
 */
