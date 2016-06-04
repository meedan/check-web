import { ERROR } from '../constants/ActionTypes';
import { sendNotification } from '../actions/extension';

const events = [
  {
    catch: [ERROR],
    dispatch: sendNotification
  }
];

export default events;
