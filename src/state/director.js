import _ from "lodash";
import { combineReducers } from "redux";
import { createActions } from "./util";
import { collectionOf, actors as collectionActors } from "./collection";

const actors = {
  changeTeam: (id, { teamA, teamB, ...s }) => {
    const [oldTeam, newTeam] = id in teamA ? [teamA, teamB] : [teamB, teamA];
    const [oldTeamName, newTeaName] =
      id in teamA ? ["teamA", "teamB"] : ["teamB", "teamA"];

    const payload = _.cloneDeep(oldTeam[id]);

    return {
      ...s,
      [oldTeamName]: collectionActors.remove({ id }, oldTeam),
      [newTeaName]: collectionActors.add({ id, payload }, newTeam),
    };
  },
};

export const actions = createActions(actors);

/**
 *
 * @param {string} type
 * @return {function(Object): Object}
 */
export const updateDerivedValue = ({ type }) => (state) => {
  // if (type in bodyActions) {
  //   const player = state.teamA.player || state.teamB.player;
  //   const target = state.teamA.target || state.teamB.target;
  //
  //   const dx = player.x - target.x;
  //   const dy = player.y - target.y;
  //   return {
  //     ...state,
  //     distance: Math.hypot(dx, dy),
  //   };
  // }
  return state;
};
