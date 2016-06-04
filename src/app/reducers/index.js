import { combineReducers } from 'redux';
import app from './app';
import extension from './extension';

export default combineReducers({ app, extension });
