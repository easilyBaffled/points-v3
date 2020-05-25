import { createActions, createReducer, not } from "./util";
import tags, {
  hasPending,
  hasRecurring,
  hasStreak,
  isRecurring,
  isStreak,
  isInfectious,
  removeTag,
  status,
  isInfectedBy,
  hasInfectious,
  hasInfectedBy,
  hasDone,
  hasActive,
  createTag,
} from "./tags";
import { isTestEnv, debugDate } from "./debugUtil";
import { isDaysAgo } from "../util";

const cycleStatusTag = (task) => {
  task.tags = removeTag(task, status.pending);
  task.tags.push(status.done);
};

const resolveStreakTask = (t, state) => {
  const { streak } = t.tags.find(isStreak);
  const index = streak.findIndex((v) => !v);
  streak[index] = isTestEnv ? debugDate() : Date.now();

  state.bank += index + 1;

  t.tags = removeTag(t, status.pending);
  t.tags.push(index === streak.length - 1 ? status.done : status.active);
};

const resolveOldTasks = (t) => {
  if (isDaysAgo(t.createdAt, 5)) {
    t.tags.unshift(tags.infectious());
  }
};

const spreadInfection = (infectiousTasks, tasks) => {
  const pickedTask = tasks.find(
    (t) => t.id !== infectiousTasks.id && !isInfectedBy(t) && !isInfectious(t)
  );

  if (pickedTask) {
    console.log("setting?");
    pickedTask.tags.unshift(
      tags.infectedBy(infectiousTasks.id, pickedTask.value)
    );
    pickedTask.value = null;
    infectiousTasks.tags.find(isInfectious).infected.push(pickedTask.id);
  }
};

const actors = {
  create: ({ tags = [] }, state) => {
    state.categories.push(
      ...tags
        .filter(
          (t) =>
            typeof t === "string" &&
            !state.categories.find((tag) => tag.id === t)
        )
        .map((t) => createTag(t, true))
    );

    return state;
  },
  resolveDay: (__, state) => {
    state.tasks.forEach((t) => {
      if (!hasInfectious(t)) {
        // When a task is first infected it should still trigger infection, which is why it's not paired in an if/else
        resolveOldTasks(t);
      }
      if (hasInfectious(t) && !hasPending(t)) {
        const pickedTask = state.tasks.find(
          (subject) =>
            subject.id !== t.id &&
            !hasInfectedBy(subject) &&
            !hasInfectious(subject)
        );
        if (pickedTask) {
          t.value += pickedTask.value;
          pickedTask.tags.unshift(tags.infectedBy(t.id, pickedTask.value));
          pickedTask.value = null;

          t.tags.find(isInfectious).infected.push(pickedTask.id);
        }
      }
      if (hasPending(t)) {
        if (hasInfectious(t)) {
          t.tags.find(isInfectious).infected.forEach((id) => {
            const task = state.tasks.find((task) => task.id === id);
            if (hasActive(task)) {
              const infection = task.tags.find(isInfectedBy);
              task.value = infection.value;
              task.tags = removeTag(task, tags.infectedBy());
            }
          });
        }
        if (hasStreak(t) || hasRecurring(t)) {
          if (hasStreak(t)) {
            resolveStreakTask(t, state); // I will have a conflict with infected tasks, as it doesn't read from value
          }
          if (hasRecurring(t)) {
            t.tags = removeTag(t, status.pending);
            t.tags.push(status.active);

            t.tags
              .find(isRecurring)
              .done.push(isTestEnv ? debugDate() : Date.now());

            state.bank += t.value;
          }
        } else {
          cycleStatusTag(t);
          if (t.value) {
            state.bank += t.value;
          }
        }
      }
    });
  },
};

export const actions = createActions(actors);

export default createReducer(actors, {});
