import Relay from 'react-relay';

const userTooltipFragment = Relay.QL`
  fragment on User {
    id,
    dbid,
    name,
    source {
      id,
      dbid,
      image,
    }
  }
`;

module.exports = userTooltipFragment;
