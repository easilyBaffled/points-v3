import { curryRight2 } from "../util";
import _ from "lodash";
export const createTag = (name, isCustom) => {
  const tag = {
    id: name,
    name,
  };
  if (isCustom) {
    tag.isCustom = true;
  }
  return tag;
};
const tags = {
  recurring: { id: "recurring", name: "recurring", done: [] },
  streak: (length) => ({
    ...createTag("streak"),
    streak: Array(length).fill(false),
  }),
  infectious: (...infected) => ({
    ...createTag("infectious"),
    infected,
  }),
  infectedBy: (infectiousId, value) => ({
    ...createTag("infectedBy"),
    infectiousId,
    value,
  }),
};

export const status = {
  active: { id: "active", name: "active" },
  pending: { id: "pending", name: "pending" },
  done: { id: "done", name: "done" },
};

const isTag = (subjectTag, expectedTag) => {
  if (!expectedTag) {
    // Very crude implementation of curryRight2
    return (realSub) => isTag(realSub, subjectTag);
  }
  return subjectTag.id === expectedTag.id;
};

const hasTag = (task, tag) => {
  if (!tag) {
    // Very crude implementation of curryRight2
    return (realTask) => hasTag(realTask, task);
  }

  return !!task.tags.find((t) => t.id === tag.id);
};

export const hasActive = hasTag(status.active);
export const hasPending = hasTag(status.pending);
export const hasDone = hasTag(status.done);
export const hasRecurring = hasTag(tags.recurring);
export const hasStreak = hasTag(tags.streak());
export const hasInfectious = hasTag(tags.infectious());
export const hasInfectedBy = hasTag(tags.infectedBy());

export const isActive = isTag(status.active);
export const isPending = isTag(status.pending);
export const isDone = isTag(status.done);
export const isRecurring = isTag(tags.recurring);
export const isStreak = isTag(tags.streak());
export const isInfectious = isTag(tags.infectious());
export const isInfectedBy = isTag(tags.infectedBy());

export const removeTag = (task, tag) => task.tags.filter((t) => !isTag(t, tag));

export default tags;
