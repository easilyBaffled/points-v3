import { createActions, createReducer } from "./util";
import { createTag, hasStreak, status } from "./tags";

export const initialState = {
  tags: [status.active.id, status.pending.id],
};

export const actors = {
  setFilterTag: (id, s) => {
    s.tags = [id];
  },
  addFilterTag: (id, s) => {
    const ids = Array.isArray(id) ? id : [id];
    s.tags.push(...ids);
  },
  removeFilterTag: (id, s) => {
    const ids = Array.isArray(id) ? id : [id];
    s.tags = s.tags.filter((t) => !ids.includes(t));
  },
  resetFilterTag: (__, s) => {
    s.tags = initialState.tags;
  },
};

export const actions = createActions(actors);

export default createReducer(actors, initialState);
