import React from 'react';
import Relay from 'react-relay';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import Avatar from 'material-ui/Avatar';
import { Card, CardText } from 'material-ui/Card';
import MdLaunch from 'react-icons/lib/md/launch';
import ParsedText from '../ParsedText';
import MediaUtil from '../media/MediaUtil';
import { truncateLength } from '../../helpers';
import UserRoute from '../../relay/UserRoute';
import {
  white,
  black54,
  body2,
  caption,
  units,
} from '../../styles/js/shared';

class UserTooltipComponent extends React.Component {
  accountLink(account) {
    return <a key={account.id} href={account.url} target="_blank" rel="noopener noreferrer" style={{ paddingRight: units(1) }}>
      { MediaUtil.socialIcon(`${account.provider}.com`) /* TODO: refactor */ }
    </a>;
  }

  render() {
    const { user } = this.props;
    const { source } = this.props.user;

    return (
      <div>
        <section className="layout-two-column">
          <div className="column-secondary">
            <Avatar
              className="avatar"
              src={user.source.image}
              alt={user.name}
              style={{ marginRight: units(2) }}
            />
          </div>

          <div className="column-primary">
            <div className="tooltip__primary-info">
              <strong className="tooltip__name" style={{ font: body2, fontWeight: 500 }}>
                {user.name}
              </strong>

              <Link to={`/check/user/${user.dbid}`} style={{float: 'right'}}>
                <MdLaunch />
              </Link>

              <div className="tooltip__description">
                <p className="tooltip__description-text" style={{ font: caption }}>
                  <ParsedText text={truncateLength(source.description, 600)} />
                </p>
              </div>
            </div>

            <div className="tooltip__contact-info">
              <FormattedHTMLMessage
                id="userTooltip.dateJoined" defaultMessage="Joined {date} &bull; {number} teams"
                values={{
                  date: this.props.intl.formatDate(MediaUtil.createdAt({ published: source.created_at }), { year: 'numeric', month: 'short', day: '2-digit' }),
                  number: user.number_of_teams,
                }}
              />
            </div>
            { source.account_sources.edges.map(as => this.accountLink(as.node.account)) }
          </div>
        </section>
      </div>
    );
  }
}

const UserTooltipContainer = Relay.createContainer(injectIntl(UserTooltipComponent), {
  fragments: {
    user: () => Relay.QL`
      fragment on User {
        id,
        dbid,
        name,
        number_of_teams,
        source {
          id,
          dbid,
          image,
          description,
          created_at,
          account_sources(first: 10000) {
            edges {
              node {
                account {
                  id,
                  url,
                  provider
                }
              }
            }
          }
        }
      }
    `,
  },
});

class UserTooltip extends React.Component {
  render() {
    const route = new UserRoute({ userId: this.props.user.dbid });
    return (
      <Relay.RootContainer
        Component={UserTooltipContainer}
        route={route}
      />
    );
  }
}

export default UserTooltip;
