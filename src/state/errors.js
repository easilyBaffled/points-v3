import { createActions, createReducer, transform } from "./util";

const initialState = {};

// const conditions = {
//     insufficientPoints: (action, state) => {
//         action.
//     }
// }

let debugErrorCounter = 0;

export const actors = {
  createError: ({ id, type }) => ({ id, type }),
  ...["insufficientPoints"].reduce(
    transform((type) => (id = `e${debugErrorCounter++}`) =>
      actors.createError({ id, type })
    ),
    {}
  ),
};

export const actions = createActions(actors, "error");

export default createReducer(actors, initialState, "error");
