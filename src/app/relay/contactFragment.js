import Relay from 'react-relay';

var contactFragment = Relay.QL`
  fragment on Contact {
    id,
    location,
    team_id,
    phone
  }
`;

module.exports = contactFragment;
