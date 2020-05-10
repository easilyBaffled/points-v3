import { createActions, createReducer, transform } from "./util";

const createTag = (name) => ({
  id: name,
  name,
});

export const status = ["active", "pending"].reduce(transform(createTag), {});
