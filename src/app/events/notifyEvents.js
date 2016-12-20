import { ERROR } from '../constants/ActionTypes';
import { sendNotification } from '../actions/notifications';

const events = [
  {
    catch: [ERROR],
    dispatch: sendNotification,
  },
];

export default events;
