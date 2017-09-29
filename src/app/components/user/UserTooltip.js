import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import { Link } from 'react-router';
import Avatar from 'material-ui/Avatar';
import { Card, CardText } from 'material-ui/Card';
import MdLaunch from 'react-icons/lib/md/launch';
import ParsedText from '../ParsedText';
import MediaUtil from '../media/MediaUtil';
import { truncateLength } from '../../helpers';
import {
  white,
  black54,
  body2,
  caption,
  units,
} from '../../styles/js/shared';

class UserTooltip extends React.Component {
  accountLink(account) {
    return <a key={account.id} href={account.url} target="_blank" rel="noopener noreferrer" style={{ paddingRight: units(1) }}>
      { MediaUtil.socialIcon(`${account.provider}.com`) /* TODO: refactor */ }
    </a>;
  }

  render() {
    const { user } = this.props;
    const { source } = this.props.user;

    return (
      <div style={{backgroundColor: white, opacity: 1 }}>
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
                  number: user.team_users.edges.length || '0',
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

export default injectIntl(UserTooltip);
