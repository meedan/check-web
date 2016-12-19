import { connect } from 'react-redux';
import Home from '../components/Home';

function mapStateToProps(state, ownProps) {
  return {
    state: state,
    filter: ownProps.location.query.filter
  };
}

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
