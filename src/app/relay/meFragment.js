import Relay from 'react-relay/classic';
import sourceFragment from './sourceFragment';

const meFragment = Relay.QL`
  fragment on Me {
    id,
    dbid,
    name,
    email,
    providers,
    two_factor,
    is_active,
    confirmed,
    unconfirmed_email,
    permissions,
    profile_image,
    number_of_teams,
    get_send_email_notifications,
    get_send_successful_login_notifications,
    get_send_failed_login_notifications,
    source {
      ${sourceFragment}
    }
  }
`;

export default meFragment;
