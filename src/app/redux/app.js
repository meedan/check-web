import { LOCATION_CHANGE } from 'react-router-redux';
import { NOTIFY_SEND, NOTIFY_RECEIVE, SET_CONTEXT } from './ActionTypes';

export default function app(state_ = { session: null }, action) {
  const state = state_;
  if (action.type === SET_CONTEXT) {
    state.context = action;
    return state;
  }
  if (action.type === LOCATION_CHANGE) {
    state.routing = { locationBeforeTransitions: action.payload };
    return state;
  }
  if (action.type === NOTIFY_SEND || action.type === NOTIFY_RECEIVE) {
    return state;
  }
  return action;
}
