import { createActions, createReducer, transform } from "./util";

const initialState = {};

export const insufficientPoints = (id) => ({
  id,
  type: "insufficientPoints",
});
insufficientPoints.type = "insufficientPoints";

// const conditions = {
//     insufficientPoints: (action, state) => {
//         action.
//     }
// }

export const actors = {
  create: ({ id, type }) => ({ id, type }),
  ...["insufficientPoints"].reduce(
    transform((type) => (id) => actors.create({ id, type })),
    {}
  ),

  // initialize: (initObj, s) => ({ ...s, ...initObj }),
  // init: (...args) => actors.initialize(...args),
  // by: (...args) => {
  //   if (args.length === 1 && typeof args[0] === "object") {
  //     const { x: dx = 0, y: dy = 0 } = args[0];
  //     return ({ x, y, r }) => ({ x: x + dx, y: y + dy, r });
  //   } else {
  //     const [dx = 0, dy = 0] = args;
  //
  //     return ({ x, y, r }) => ({ x: x + dx, y: y + dy, r });
  //   }
  // },
  // to: ({ nextX, nextY }, { y, r }) => ({ x: nextX, y: nextY || y, r }),
  // up: (y = -1) => actors.by({ y: y > 0 ? -1 * y : y }),
  // down: (y = 1) => actors.by({ y: y < 0 ? -1 * y : y }),
  // left: (x = -1) => actors.by({ x: x > 0 ? -1 * x : x }),
  // right: (x = 1) => actors.by({ x: x < 0 ? -1 * x : x }),
};

export const actions = createActions(actors);

export default createReducer(actors, initialState);
