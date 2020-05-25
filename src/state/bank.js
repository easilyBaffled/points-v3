import { createActions, createReducer } from "./util";

const initialState = 0;

export const actors = {
  initBank: (payload) => payload,
  set: (payload) => payload,
  add: (payload, s) => s + payload,
  subtract: (payload, s) => s - payload,
  spend: (payload, s) => s - payload,
};

export const actions = createActions(actors);

export default createReducer(actors, initialState);
