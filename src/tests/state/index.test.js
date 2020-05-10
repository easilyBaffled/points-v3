import { status, tags } from "../../state/tags";
import app, { actions as appActions, initialState } from "../../state";
// import { actions as taskActions } from "../../state/task";
// import { actions as bankActions } from "../../state/bank";
import {
  actors as errorActors,
  actions as errorActions,
} from "../../state/errors";
import {
  actions as collectionActions,
  actors as collectionActors,
} from "../../state/collection";

import { withId } from "../../state/util";

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
        tasks: [{ id: 1, name: 1, value: 1, tags: [status.active] }],
      };

      expect(actual).toEqual(expect.objectContaining(expected));
    });
    test("Mark a task complete", () => {
      const prevState = {
        ...initialState,
        tasks: [{ id: 1, name: 1, value: 1, tags: [status.active] }],
      };
      const expected = app(prevState, taskActions.setPending({ id: 1 }));
      const actual = {
        tasks: [{ id: 1, name: 1, value: 1, tags: [status.pending] }],
      };

      expect(actual).toEqual(expect.objectContaining(expected));
    });
    test("Resolve first day", () => {
      const prevState = {
        ...initialState,
        tasks: [{ id: 1, name: 1, value: 1, tags: [status.pending] }],
      };
      const expected = app(prevState, appActions.resolveDay());
      const actual = {
        tasks: [{ id: 1, name: 1, value: 1, tags: [status.done] }],
        bank: 1,
      };

      expect(actual).toEqual(expect.objectContaining(expected));
    });
    describe("Recurring Task", () => {
      test("create recurring task", () => {
        const expected = app(
          initialState,
          taskActions.create({ id: 1, name: 1, tags: [tags.recurring] })
        );
        const actual = {
          tasks: [
            { id: 1, name: 1, value: 1, tags: [status.active, tags.recurring] },
          ],
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
      test("Resolve recurring task", () => {
        const prevState = {
          ...initialState,
          tasks: [
            { id: 1, name: 1, value: 1, tags: [status.active, tags.recurring] },
          ],
        };
        const expected = app(prevState, appActions.resolveDay());
        const actual = {
          tasks: [
            { id: 1, name: 1, value: 1, tags: [status.active, tags.recurring] },
            { id: 1.1, name: 1, value: 1, tags: [status.done, tags.recurring] },
          ],
          bank: 1,
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
    });
    describe("Streak Task", () => {
      test("Create Task With a Streak", () => {
        const expected = app(
          initialState,
          taskActions.create({ id: 6, name: 6, tags: [tags.newStreak(5)] })
        );
        const actual = {
          tasks: [
            {
              id: 6,
              name: 4,
              value: tags.streak.id,
              tags: [
                status.active,
                { ...tags.streak, streak: [false, false, false, false, false] },
              ],
            },
          ],
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
      test("Complete Task", () => {
        const appState = {
          ...initialState,
          tasks: [
            {
              id: 6,
              name: 4,
              value: tags.streak.id,
              tags: [
                status.active,
                { ...tags.streak, streak: [false, false, false, false, false] },
              ],
            },
          ],
        };
        const expected = app(appState, taskActions.setPending({ id: 6 }));
        const actual = {
          tasks: [
            {
              id: 6,
              name: 4,
              value: tags.streak.id,
              tags: [
                status.pending,
                { ...tags.streak, streak: [true, false, false, false, false] },
              ],
            },
          ],
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
      test("Resolve day with a Complete Task", () => {
        const appState = {
          ...initialState,
          tasks: [
            {
              id: 6,
              name: 4,
              value: tags.streak.id,
              tags: [
                status.pending,
                { ...tags.streak, streak: [true, false, false, false, false] },
              ],
            },
          ],
        };
        const expected = app(appState, taskActions.setPending({ id: 6 }));
        const actual = {
          tasks: [
            {
              id: 6,
              name: 4,
              value: tags.streak.id,
              tags: [
                status.active,
                { ...tags.streak, streak: [true, false, false, false, false] },
              ],
            },
          ],
          bank: 1,
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
      test("Resolve a full streak", () => {
        const expected = {
          ...initialState,
          tasks: [
            {
              id: 6,
              name: 4,
              value: tags.streak.id,
              tags: [
                status.pending,
                { ...tags.streak, streak: [true, true, true] },
              ],
            },
          ],
          bank: 3,
        };
        const actual = {
          tasks: [
            {
              id: 6,
              name: 4,
              value: tags.streak.id,
              tags: [
                status.done,
                { ...tags.streak, streak: [true, true, true] },
              ],
            },
          ],
          bank: 6,
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
    });
    describe("Infection", () => {
      test("Task becomes infectious", () => {
        let oldDate = new Date();
        oldDate.setDate(dt.getDate() - 10);

        const prevState = {
          ...initialState,
          tasks: [
            { id: 2, name: 1, value: 2, created_at: Date.now().toISOString() },
            { id: 1, name: 1, value: 1, created_at: oldDate.toISOString() },
          ],
          bank: 0,
        };
        const expected = app(prevState, appActions.resolveDay());
        const actual = {
          tasks: [
            {
              id: 2,
              name: 1,
              value: null,
              tags: [status.active, tags.infectedBy(1, 2)], // ( id, value )
            },
            {
              id: 1,
              name: 1,
              value: 1,
              tags: [status.active, tags.infectious(2)],
            },
          ],
          bank: 0,
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
      test("Resolve completed infected task", () => {
        let oldDate = new Date();
        oldDate.setDate(dt.getDate() - 10);

        const prevState = {
          ...initialState,
          tasks: [
            {
              id: 2,
              name: 1,
              value: null,
              tags: [status.pending, tags.infectedBy(1, 2)],
            },
            {
              id: 3,
              name: 1,
              value: 1,
              created_at: Date.now().toISOString(),
            },
            {
              id: 1,
              name: 1,
              value: 1,
              tags: [status.active, tags.infectious(2)],
            },
          ],
          bank: 0,
        };
        const expected = app(prevState, appActions.resolveDay());
        const actual = {
          tasks: [
            {
              id: 2,
              name: 1,
              value: null,
              tags: [status.done, tags.infectedBy(1, 2)],
            },
            {
              id: 3,
              name: 1,
              value: null,
              tags: [status.done, tags.infectedBy(1, 1)],
            },
            {
              id: 1,
              name: 1,
              value: 3,
              tags: [status.active, tags.infectious(2, 3)],
            },
          ],
          bank: 0,
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
      test("Resolve completed infected task", () => {
        let oldDate = new Date();
        oldDate.setDate(dt.getDate() - 10);

        const prevState = {
          ...initialState,
          tasks: [
            {
              id: 2,
              name: 1,
              value: null,
              tags: [status.pending, tags.infectedBy(1, 1)],
            },
            {
              id: 1,
              name: 1,
              value: 1,
              tags: [status.pending, tags.infectious(2)],
            },
          ],
          bank: 0,
        };
        const expected = app(prevState, appActions.resolveDay());
        const actual = {
          tasks: [
            {
              id: 2,
              name: 1,
              value: null,
              tags: [status.done, tags.infectedBy(1, 1)],
            },
            {
              id: 1,
              name: 1,
              value: 2,
              tags: [status.pending, tags.infectious(2)],
            },
          ],
          bank: 2,
        };

        expect(actual).toEqual(expect.objectContaining(expected));
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
          { id: 2, name: 2, value: 1, tags: [status.active, { id: "tag1" }] },
        ],
        categories: [{ id: "tag1" }],
      };

      expect(actual).toEqual(expect.objectContaining(expected));
    });
    test("Create a task with an existing category tag", () => {
      const appState = {
        tasks: [
          { id: 2, name: 2, value: 1, tags: [status.pending, { id: "tag1" }] },
          { id: 1, name: 2, value: 1, tags: [status.done, { id: "tag1" }] },
        ],
        categories: [{ id: "tag1" }],
      };
      const expected = app(
        { ...initialState, ...appState },
        taskActions.create({ id: 3, name: 2, tags: ["tag1"] })
      );
      const actual = {
        tasks: [
          { id: 3, name: 2, value: 1, tags: [status.active, { id: "tag1" }] },
          ...appState.tasks,
        ],
        categories: appState.categories,
      };

      expect(actual).toEqual(expect.objectContaining(expected));
    });
    describe("View Filtering", () => {
      test("Filter on Category Tag", () => {
        const expected = app(initialState, appAction.addFilter({ id: "tag1" }));
        const actual = {
          filters: [
            {
              tags: [status.active, status.pending, { id: "tag1" }],
            },
          ],
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
      test("Filter on Status.pending", () => {
        const expected = app(
          initialState,
          appAction.setFilters(status.pending)
        );
        const actual = {
          filters: [
            {
              tags: [status.pending],
            },
          ],
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
      test("Filter on Status.done", () => {
        const expected = app(initialState, appAction.setFilters(status.done));
        const actual = {
          filters: [
            {
              tags: [status.done],
            },
          ],
        };

        expect(actual).toEqual(expect.objectContaining(expected));
      });
      test("Clear specific Filter", () => {
        const appState = {
          ...initialState,
          filters: [
            {
              tags: [status.active, status.pending, { id: "tag1" }],
            },
          ],
        };

        const expected = app(
          initialState,
          appAction.clearFilter({ id: "tag1" })
        );
        const actual = initialState;

        expect(actual).toEqual(expect.objectContaining(expected));
      });
      test("Clear All Filters", () => {
        const appState = {
          ...initialState,
          filters: [
            {
              tags: [
                status.active,
                status.pending,
                { id: "tag1" },
                { id: "tag2" },
              ],
            },
          ],
        };
        const expected = app(appState, appAction.resetFilters());
        const actual = initialState;

        expect(actual).toEqual(expect.objectContaining(expected));
      });
    });
  });
  describe("Bank", () => {
    test("Spend Points you don't have", () => {
      const expected = app(initialState, bankActions.spendPoints(1));
      const actual = {
        errors: [errorActors.insufficientPoints("e1")],
      };

      expect(actual).toEqual(expect.objectContaining(expected));
    });
    test("Spend Points", () => {
      const prevState = {
        ...initialState,
        bank: 1,
      };
      const expected = app(initialState, bankActions.spendPoints(1));
      const actual = {
        bank: 0,
      };

      expect(actual).toEqual(expect.objectContaining(expected));
    });
  });
  describe("Misc.", () => {
    test("Clear Error", () => {
      const prevState = {
        ...initialState,
        errors: [errorActors.insufficientPoints("e1")],
      };

      const expected = app(prevState, withId(collectionActions.remove(), "e1"));
      const actual = initialState;

      expect(actual).toEqual(expect.objectContaining(expected));
    });
  });
});
