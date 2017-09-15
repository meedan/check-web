import React from 'react';
import { FormattedHTMLMessage, injectIntl } from 'react-intl';
import AccountChips from './AccountChips';
import SourcePicture from './SourcePicture';
import ParsedText from '../ParsedText';
import MediaUtil from '../media/MediaUtil';
import { truncateLength } from '../../helpers';

class UserInfo extends React.Component {
  render() {
    const { user } = this.props;
    const { source } = this.props.user;

    return (
      <div className="source__profile-content">
        <section className="layout-two-column">
          <div className="column-secondary">
            <SourcePicture object={source} type="source" className="source__avatar" />
          </div>

          <div className="column-primary">
            <div className="source__primary-info">
              <h1 className="source__name">
                {user.name}
              </h1>
              <div className="source__description">
                <p className="source__description-text">
                  <ParsedText text={truncateLength(source.description, 600)} />
                </p>
              </div>
            </div>

            <AccountChips accounts={source.account_sources.edges.map(as => as.node.account)} />

            <div className="source__contact-info">
              <FormattedHTMLMessage
                id="UserInfo.dateJoined" defaultMessage="Joined {date} &bull; {number} teams"
                values={{
                  date: this.props.intl.formatDate(MediaUtil.createdAt({ published: source.created_at }), { year: 'numeric', month: 'short', day: '2-digit' }),
                  number: user.teams.edges.length || '0',
                }}
              />
            </div>

          </div>
        </section>
      </div>
    );
  }
}

export default injectIntl(UserInfo);
