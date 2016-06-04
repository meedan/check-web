import { connect } from 'react-redux';

import Router from '../components/Router';
import * as actions from '../actions/actions';

function mapStateToProps(state) {
  return { state: state };
}

const mapDispatchToProps = actions;

export default connect(mapStateToProps, mapDispatchToProps)(Router);
