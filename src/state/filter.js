import { createActions, createReducer } from "./util";
import { createTag, hasStreak, status } from "./tags";

const initialState = {
  tags: [status.active, status.pending],
};

export const actors = {
  addTag: (id, s) => {
    const ids = Array.isArray(id) ? id : [id];
    s.tags.push(...ids);
  },
  removeTag: (id, s) => {
    const ids = Array.isArray(id) ? id : [id];
    s.tags.filter();
  },
  resetTag: () => {},
  create: ({ tags = [], ...baseData }) =>
    expandTask({
      ...initialState,
      ...baseData,
      tags: tags
        .map((t) => (typeof t === "string" ? createTag(t, true) : t))
        .concat(status.active),
    }),
  removeTag: (tagId, draftTask) => {
    draftTask.tags = draftTask.tags.filter((tag) => tag.id !== tagId);
  },
  setActive: (__, draftTask) => {
    draftTask.tags = draftTask.tags
      .filter((tag) => !(tag.id in status))
      .concat(status.active);
  },
  setPending: (__, draftTask) => {
    draftTask.tags = draftTask.tags
      .filter((tag) => !(tag.id in status))
      .concat(status.pending);
  },
  setDone: (__, draftTask) => {
    draftTask.tags = draftTask.tags
      .filter((tag) => !(tag.id in status))
      .concat(status.done);
  },
};

export const actions = createActions(actors);

export default createReducer(actors, initialState);
