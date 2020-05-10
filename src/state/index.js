import _ from "lodash";
import { combineReducers } from "redux";
import { createActions, createReducer } from "./util";
import { collectionOf, actors as collectionActors } from "./collection";
import { updateDerivedValue } from "./director";
import { status } from "./tags";
import errors, { actors as errorActors } from "./errors";
const actors = {
  // clearError: collectionActors.remove,
};

export const actions = createActions(actors);

export const initialState = {
  tasks: [],
  bank: 0,
  errors: [],
  filters: [
    {
      tags: [status.active, status.pending],
    },
  ],
  categories: [], // Tags[] - user made tags
};

const reducers = combineReducers({
  // Existing reducers
  // tasks: collectionOf(tasks, taskActors, initialState.tasks),
  errors: collectionOf(errors, errorActors, initialState.errors),
  // filters: collectionOf(filters, filtersActors, initialState.filters),
  // categories: collectionOf(categories, categoryActors, initialState.filters),
  // Values that only the director will control, these values are dependant on the above reducer's values
  bank: (v = {}) => v,
});

/*
 * Standard reducers are isolated from one another. They cannot share values.
 * The Director is the only reducer with access to all of state.
 * This way it can validate and update values that have cross state dependencies
 *
 * @param {Object} state
 * @param {{payload: *, type: string}} action
 * @return {Object}
 */
const app = (state = initialState, action = {}) =>
  _.flow(
    // validationReducer(action),
    (s) => reducers(s, action),
    //(s) => createReducer(actions, initialState)(s, action),
    updateDerivedValue(action)
  )(state);

export default app;
