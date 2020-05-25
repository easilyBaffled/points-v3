import _ from "lodash";
import produce from "immer";
import { combineReducers } from "redux";
import { createActions, createReducer } from "./util";
import { collectionOf, actors as collectionActors } from "./collection";
import directorReducer from "./director";
import { status } from "./tags";
import errors, { actors as errorActors } from "./errors";
import tasks, { actors as taskActors } from "./task";
import filters, { initialState as initialFilterState } from "./filter";
import bankReducer from "./bank";
const actors = {
  // clearError: collectionActors.remove,
};

export const actions = createActions(actors);

export const initialState = {
  tasks: [],
  bank: 0,
  errors: [],
  filters: initialFilterState,

  categories: [], // Tags[] - user made tags
};

const reducers = combineReducers({
  // Existing reducers
  tasks: collectionOf(tasks, taskActors, initialState.tasks),
  errors: collectionOf(errors, errorActors, initialState.errors),
  filters,
  categories: () => [], // collectionOf(categories, categoryActors, initialState.filters),
  // Values that only the director will control, these values are dependant on the above reducer's values
  bank: bankReducer,
});

const validators = {
  spend: (payload, appState) =>
    payload > appState.bank && errorActors.insufficientPoints(),
};

const validationReducer = (state, { type, payload } = {}) => {
  const validation =
    type in validators ? validators[type](payload, state) : false;
  if (!validation) return false;
  return produce(state, (draft) => {
    draft.errors.push(validation);
  });
};

/*
 * Standard reducers are isolated from one another. They cannot share values.
 * The Director is the only reducer with access to all of state.
 * This way it can validate and update values that have cross state dependencies
 *
 * @param {Object} state
 * @param {{payload: *, type: string}} action
 * @return {Object}
 */
const app = (state = initialState, action = {}) => {
  const validationRes = validationReducer(state, action);
  if (validationRes) {
    // validationRes will be false if there were no errors
    return validationRes;
  }

  return directorReducer(reducers(state, action), action);
};
export default app;
