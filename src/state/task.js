import { createActions, createReducer } from "./util";
import { isTestEnv, debugDate } from "./debugUtil";
import { createTag, hasStreak, status } from "./tags";

const initialState = {
  id: Date.now(),
  createdAt: isTestEnv ? debugDate() : Date.now(),
  name: null,
  value: 1,
  tags: [status.active],
};

const applyStreakTask = (t) => ((t.value = null), t);

const expandTask = (t) => {
  const expanderMap = {
    [true]: () => t,
    [hasStreak(t)]: () => applyStreakTask(t),
  };
  return expanderMap[true]();
};

export const actors = {
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
