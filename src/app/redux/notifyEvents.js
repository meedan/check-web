import { ERROR } from './ActionTypes';
import { sendNotification } from './notifications';

const events = [
  {
    catch: [ERROR],
    dispatch: sendNotification,
  },
];

export default events;
