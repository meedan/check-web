import { connect } from 'react-redux';
import * as actions from '../actions/actions';
import Home from '../components/Home';

function mapStateToProps(state, ownProps) {
  return {
    state: state,
    filter: ownProps.location.query.filter
  };
}

const mapDispatchToProps = actions;

export default connect(mapStateToProps, mapDispatchToProps)(Home);
