import tags, { status } from "../../state/tags";
import app, { initialState } from "../../state";
import { actions as taskActions, actors as taskActors } from "../../state/task";
import { actions as bankActions } from "../../state/bank";
import { actors as errorActors } from "../../state/errors";
import { actions as filterActions } from "../../state/filter";
import { actions as collectionActions } from "../../state/collection";
import { actions as directorActions } from "../../state/director";

import { withId } from "../../state/util";
import { debugDate } from "../../state/debugUtil";

console.tap = (v, ...args) => (console.log(v, ...args), v);
console.tap.label = (l, ...args) => (v) => (console.log(l, v, ...args), v);
console.tap.apply = (func, ...args) => (v) => (
  console.log(func(v), ...args), v
);

const baseTask = {
  active: {
    id: 1,
    name: 1,
    value: 1,
    createdAt: debugDate(),
    tags: [status.active],
  },
  pending: {
    id: 1,
    name: 1,
    value: 1,
    createdAt: debugDate(),
    tags: [status.pending],
  },
  done: {
    id: 1,
    name: 1,
    value: 1,
    createdAt: debugDate(),
    tags: [status.done],
  },
  with: (...tags) => ({ ...baseTask.active, tags }),
};

describe("How the World Works", () => {
  test("initial state", () => {
    const expected = app();
    const actual = initialState;

    expect(actual).toEqual(expected);
  });
  describe("Task", () => {
    test("Add a new task", () => {
      const expected = app(
        initialState,
        taskActions.create({ id: 1, name: 1 })
      );
      const actual = {
        tasks: [baseTask.active],
      };
      // expect(expected.tasks).toEqual(actual.tasks);
      expect(expected).toMatchObject(expect.objectContaining(actual));
    });
    test("Mark a task complete", () => {
      const prevState = {
        ...initialState,
        tasks: [taskActors.create({ id: 1, name: 1 })],
      };
      const expected = app(prevState, taskActions.setPending({ id: 1 }));
      const actual = {
        tasks: [baseTask.pending],
      };

      expect(expected).toMatchObject(expect.objectContaining(actual));
    });
    test("Resolve first day", () => {
      const prevState = {
        ...initialState,
        tasks: [baseTask.pending],
      };
      const expected = app(prevState, directorActions.resolveDay());
      const actual = {
        tasks: [baseTask.done],
        bank: 1,
      };

      expect(expected).toMatchObject(expect.objectContaining(actual));
    });
    describe("Recurring Task", () => {
      test("create recurring task", () => {
        const expected = app(
          initialState,
          taskActions.create({ id: 1, name: 1, tags: [tags.recurring] })
        );
        const actual = {
          tasks: [baseTask.with(tags.recurring, status.active)],
        };
        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
      test("Resolve recurring task", () => {
        const prevState = {
          ...initialState,
          tasks: [baseTask.with(tags.recurring, status.pending)],
        };

        const expected = app(prevState, directorActions.resolveDay());
        const actual = {
          tasks: [
            {
              ...baseTask.active,
              tags: [{ ...tags.recurring, done: [debugDate()] }, status.active],
            },
          ],
          bank: 1,
        };

        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
    });
    describe("Streak Task", () => {
      test("Create Task With a Streak", () => {
        const expected = app(
          initialState,
          taskActions.create({ id: 1, name: 1, tags: [tags.streak(5)] })
        );
        const actual = {
          tasks: [
            {
              ...baseTask.with(
                {
                  ...tags.streak(),
                  streak: [false, false, false, false, false],
                },
                status.active
              ),
              value: null,
            },
          ],
        };
        //expect(actual.tasks).toEqual(expected.tasks);
        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
      test("Complete Task", () => {
        const appState = {
          ...initialState,
          tasks: [
            taskActors.create({ tags: [tags.streak(5)], id: 1, name: 1 }),
          ],
        };

        const expected = app(appState, taskActions.setPending({ id: 1 }));
        const actual = {
          tasks: [
            {
              ...baseTask.with(
                {
                  ...tags.streak(),
                  streak: [false, false, false, false, false],
                },
                status.pending
              ),
              value: null,
            },
          ],
          bank: 0,
        };

        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
      test("Resolve day with a Complete Task", () => {
        const appState = {
          ...initialState,
          tasks: [
            {
              ...baseTask.with(
                {
                  ...tags.streak(),
                  streak: [false, false, false, false, false],
                },
                status.pending
              ),
              value: null,
            },
          ],
        };

        const expected = app(appState, directorActions.resolveDay());
        const actual = {
          tasks: [
            {
              ...baseTask.with(
                {
                  ...tags.streak(),
                  streak: [debugDate(), false, false, false, false],
                },
                status.active
              ),
              value: null,
            },
          ],
          bank: 1,
        };

        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
      test("Resolve a full streak", () => {
        const appState = {
          ...initialState,
          tasks: [
            {
              ...baseTask.with(
                {
                  ...tags.streak(),
                  streak: [debugDate(), false],
                },
                status.pending
              ),
              value: null,
            },
          ],
        };

        const expected = app(appState, directorActions.resolveDay());
        const actual = {
          tasks: [
            {
              ...baseTask.with(
                {
                  ...tags.streak(),
                  streak: [debugDate(), debugDate()],
                },
                status.done
              ),
              value: null,
            },
          ],
          bank: 2,
        };
        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
    });
    describe("Infection", () => {
      test("Task becomes infectious", () => {
        let oldDate = debugDate();
        oldDate.setDate(oldDate.getDate() - 10);

        const prevState = {
          ...initialState,
          tasks: [
            taskActors.create({
              id: 1,
              name: "patient zero",
              createdAt: oldDate,
            }),
            taskActors.create({ id: 2, name: "subject" }),
          ],
        };
        const expected = app(prevState, directorActions.resolveDay());
        const actual = {
          tasks: [
            taskActors.create({
              id: 1,
              name: "patient zero",
              createdAt: oldDate,
              value: 2,
              tags: [{ id: "infectious", name: "infectious", infected: [2] }],
            }),
            taskActors.create({
              id: 2,
              name: "subject",
              value: null,
              tags: [
                {
                  id: "infectedBy",
                  name: "infectedBy",
                  infectiousId: 1,
                  value: 1,
                },
              ],
            }),
          ],
        };

        expect(expected.tasks).toEqual(actual.tasks);
        // expect(expected).toMatchObject(expect.objectContaining(actual));
      });
      test("Resolve completed infected task", () => {
        let oldDate = debugDate();
        oldDate.setDate(oldDate.getDate() - 10);

        const prevState = {
          ...initialState,
          tasks: [
            taskActors.create({
              id: 1,
              name: "patient zero",
              createdAt: oldDate,
              tags: [{ id: "infectious", name: "infectious", infected: [2] }],
            }),
            {
              ...taskActors.create({ id: 2, name: "subject" }),
              tags: [
                {
                  id: "infectedBy",
                  name: "infectedBy",
                  infectiousId: 1,
                  value: 1,
                },
                status.pending,
              ],
              value: null,
            },
            taskActors.create({ id: 3, name: "next subject" }),
          ],
          bank: 0,
        };
        const expected = app(prevState, directorActions.resolveDay());
        const actual = {
          tasks: [
            taskActors.create({
              id: 1,
              name: "patient zero",
              createdAt: oldDate,
              value: 2,
              tags: [
                { id: "infectious", name: "infectious", infected: [2, 3] },
              ],
            }),
            {
              ...taskActors.create({ id: 2, name: "subject" }),
              tags: [
                {
                  id: "infectedBy",
                  name: "infectedBy",
                  infectiousId: 1,
                  value: 1,
                },
                status.done,
              ],
              value: null,
            },
            taskActors.create({
              id: 3,
              name: "next subject",
              value: null,
              tags: [
                {
                  id: "infectedBy",
                  name: "infectedBy",
                  infectiousId: 1,
                  value: 1,
                },
              ],
            }),
          ],
          bank: 0,
        };

        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
      test("Resolve infectious task", () => {
        let oldDate = debugDate();
        oldDate.setDate(oldDate.getDate() - 10);

        const prevState = {
          ...initialState,
          tasks: [
            {
              ...taskActors.create({
                id: 1,
                name: "patient zero",
                createdAt: oldDate,
                value: 2,
              }),
              tags: [
                { id: "infectious", name: "infectious", infected: [2, 3] },
                status.pending,
              ],
            },
            {
              ...taskActors.create({ id: 2, name: "subject" }),
              tags: [
                {
                  id: "infectedBy",
                  name: "infectedBy",
                  infectiousId: 1,
                  value: 1,
                },
                status.done,
              ],
              value: null,
            },
            taskActors.create({
              id: 3,
              name: "next subject",
              value: null,
              tags: [
                {
                  id: "infectedBy",
                  name: "infectedBy",
                  infectiousId: 1,
                  value: 1,
                },
              ],
            }),
          ],
          bank: 0,
        };
        const expected = app(prevState, directorActions.resolveDay());
        const actual = {
          tasks: [
            {
              ...taskActors.create({
                id: 1,
                name: "patient zero",
                createdAt: oldDate,
                value: 2,
              }),
              tags: [
                { id: "infectious", name: "infectious", infected: [2, 3] },
                status.done,
              ],
            },
            {
              ...taskActors.create({ id: 2, name: "subject" }),
              tags: [
                {
                  id: "infectedBy",
                  name: "infectedBy",
                  infectiousId: 1,
                  value: 1,
                },
                status.done,
              ],
              value: null,
            },
            taskActors.create({ id: 3, name: "next subject" }),
          ],
          bank: 2,
        };
        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
    });
  });
  describe("Tags", () => {
    test("Create a task with a new category tag", () => {
      const expected = app(
        initialState,
        taskActions.create({ id: 2, name: 2, tags: ["tag1"] })
      );
      const actual = {
        tasks: [
          {
            ...taskActors.create({ id: 2, name: 2, tags: ["tag1"] }),
            tags: [{ id: "tag1", name: "tag1", isCustom: true }, status.active],
          },
        ],
        categories: [{ id: "tag1", name: "tag1", isCustom: true }],
      };
      expect(expected).toMatchObject(expect.objectContaining(actual));
    });
    test("Create a task with an existing category tag", () => {
      const appState = {
        tasks: [
          taskActors.create({ id: 1, name: 1, tags: ["tag1"] }),
          taskActors.create({ id: 2, name: 2, tags: ["tag1"] }),
        ],
        categories: [{ id: "tag1", name: "tag1", isCustom: true }],
      };
      const expected = app(
        { ...initialState, ...appState },
        taskActions.create({ id: 3, name: 3, tags: ["tag1"] })
      );
      const actual = {
        tasks: [
          taskActors.create({ id: 1, name: 1, tags: ["tag1"] }),
          taskActors.create({ id: 2, name: 2, tags: ["tag1"] }),
          {
            ...taskActors.create({ id: 3, name: 3, tags: ["tag1"] }),
            tags: [{ id: "tag1", name: "tag1", isCustom: true }, status.active],
          },
        ],
        categories: appState.categories,
      };
      expect(expected.tasks).toEqual(actual.tasks);
      // expect(expected).toMatchObject(expect.objectContaining(actual));
    });
    describe("View Filtering", () => {
      test("Filter on Category Tag", () => {
        const expected = app(initialState, filterActions.addFilterTag("tag1"));
        const actual = {
          filters: {
            tags: [status.active.id, status.pending.id, "tag1"],
          },
        };

        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
      test("Filter on Status.pending", () => {
        const expected = app(
          initialState,
          filterActions.setFilterTag(status.pending.id)
        );
        const actual = {
          filters: {
            tags: [status.pending.id],
          },
        };

        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
      test("Filter on Status.done", () => {
        const expected = app(
          initialState,
          filterActions.setFilterTag(status.done.id)
        );
        const actual = {
          filters: {
            tags: [status.done.id],
          },
        };

        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
      test("Clear specific Filter", () => {
        const appState = {
          ...initialState,
          filters: {
            tags: [status.active.id, status.pending.id, "tag1"],
          },
        };

        const expected = app(
          initialState,
          filterActions.removeFilterTag("tag1")
        );
        const actual = initialState;

        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
      test("Clear All Filters", () => {
        const appState = {
          ...initialState,
          filters: {
            tags: [status.active.id, status.pending.id, "tag1", 3],
          },
        };
        const expected = app(appState, filterActions.resetFilterTag());
        const actual = initialState;

        expect(expected).toMatchObject(expect.objectContaining(actual));
      });
    });
  });
  describe("Bank", () => {
    test("Spend Points you don't have", () => {
      const expected = app(initialState, bankActions.spend(1));
      const actual = {
        ...initialState,
        errors: [withId(errorActors.insufficientPoints(), "e0")],
      };

      expect(expected).toMatchObject(expect.objectContaining(actual));
    });
    test("Spend Points", () => {
      const prevState = {
        ...initialState,
        bank: 1,
      };
      const expected = app(prevState, bankActions.spend(1));
      const actual = initialState;

      expect(expected).toMatchObject(expect.objectContaining(actual));
    });
  });
  describe("Misc.", () => {
    test("Clear Error", () => {
      const prevState = {
        ...initialState,
        errors: [errorActors.insufficientPoints("e1")],
      };

      const expected = app(prevState, collectionActions.remove("e1"));
      const actual = initialState;

      expect(expected).toMatchObject(expect.objectContaining(actual));
    });
  });
});
