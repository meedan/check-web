import { NOTIFY_SEND, NOTIFY_RECEIVE } from '../constants/ActionTypes';

export default function app(state = { session: null }, action) {
  if (action.type === NOTIFY_SEND || action.type === NOTIFY_RECEIVE) {
    return state;
  }
  return action;
}
