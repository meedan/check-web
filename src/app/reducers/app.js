import { NOTIFY_SEND, NOTIFY_RECEIVE } from '../constants/ActionTypes';
import { LOCATION_CHANGE } from 'react-router-redux';

export default function app(state = { session: null }, action) {
  if (action.type == LOCATION_CHANGE) {
    console.log(action);
    state.routing = { locationBeforeTransitions: action.payload };
  }
  if (action.type === NOTIFY_SEND || action.type === NOTIFY_RECEIVE) {
    return state;
  }
  return action;
}
