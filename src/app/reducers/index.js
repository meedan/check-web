import { combineReducers } from 'redux';
import app from './app';
import { routerReducer } from 'react-router-redux';

export default combineReducers({ app, routing: routerReducer });
