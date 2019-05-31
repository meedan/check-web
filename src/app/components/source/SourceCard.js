import React from 'react';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import { Link } from 'react-router';
import { Card, CardText } from 'material-ui/Card';
import styled from 'styled-components';
import rtlDetect from 'rtl-detect';
import Message from '../Message';
import MediaUtil from '../media/MediaUtil';
import ProfileLink from '../layout/ProfileLink';
import ParsedText from '../ParsedText';
import TimeBefore from '../TimeBefore';
import SourceActions from './SourceActions';
import SourcePicture from './SourcePicture';
import { truncateLength, safelyParseJSON } from '../../helpers';
import { units, opaqueBlack54, subheading1, black87 } from '../../styles/js/shared';
import { refreshSource } from '../../relay/mutations/UpdateSourceMutation';
import { stringHelper } from '../../customHelpers';

const StyledSourceCardBody = styled.div`
  width: 100%;
  margin-${props => (props.isRtl ? 'right' : 'left')}: ${units(2)};
  color: ${opaqueBlack54};
  .source-card__account-link {
    svg {
      margin-${props => (props.isRtl ? 'left' : 'right')}: ${units(1)};
    }
  }
`;

const cardTextStyle = {
  display: 'flex',
  paddingLeft: units(3),
  paddingRight: units(0.5),
  paddingBottom: units(1),
};

const messages = defineMessages({
  error: {
    id: 'sourceCard.error',
    defaultMessage: 'Sorry, an error occurred while updating the source. Please try again and contact {supportEmail} if the condition persists.',
  },
});

class SourceCard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
    };
  }

  handleRefresh() {
    const { id } = this.props.source.source;

    const onFailure = (transaction) => {
      let message = `${this.props.intl.formatMessage(messages.error, { supportEmail: stringHelper('SUPPORT_EMAIL') })}`;
      const transactionError = transaction.getError();

      if (transactionError.source) {
        const json = safelyParseJSON(transactionError.source);

        if (json && json.error) {
          message = json.error;
        }
      }

      this.setState({ message });
    };

    const onSuccess = () => {
      this.setState({ message: null });
    };

    refreshSource(id, onSuccess, onFailure);
  }

  render() {
    const { source, team, project_id } = this.props.source;
    const createdAt = MediaUtil.createdAt(source);
    const sourceUrl = `/${team.slug}/project/${project_id}/source/${source.dbid}`;

    const byUser = (source.user && source.user.source && source.user.source.dbid && source.user.name !== 'Pender') ?
      (<FormattedMessage
        id="mediaDetail.byUser"
        defaultMessage="by {username}"
        values={{ username: <ProfileLink user={source.user} /> }}
      />) : '';

    return (
      <Card className="source-card">
        <CardText className="source-card__content" style={cardTextStyle}>
          <SourcePicture size="large" object={source} type="source" />
          <StyledSourceCardBody
            className="source-card__body"
            isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}
          >
            <div className="source-card__name">
              <Link style={{ font: subheading1, color: black87, fontWeight: 700 }} to={sourceUrl} className="header__app-link">{source.name}</Link>
            </div>

            <Message message={this.state.message} />

            <div className="source-card__description" style={{ paddingTop: units(0.5) }}><ParsedText text={truncateLength(source.description, 600)} /></div>

            <div className="source-card__accounts">
              <ul>
                {source.accounts.edges.map(account => (
                  <li key={account.node.id} className="source-card__account-link">
                    { MediaUtil.socialIcon(`${account.node.provider}.com`) /* TODO Remove tld assumption */ }
                    <a href={account.node.url} target="_blank" rel="noopener noreferrer">
                      { account.node.metadata.username || account.node.metadata.url }
                    </a>
                  </li>))}
              </ul>
            </div>
          </StyledSourceCardBody>
          <div className="media-detail__check-metadata source-card__footer">
            {byUser ? <span className="media-detail__check-added-by"><FormattedMessage id="mediaDetail.added" defaultMessage="Added {byUser}" values={{ byUser }} /> </span> : null}
            {createdAt ?
              <span className="media-detail__check-added-at">
                <Link to={sourceUrl} className="media-detail__check-timestamp"><TimeBefore date={createdAt} /></Link>
              </span> : null}
          </div>
          <SourceActions source={source} handleRefresh={this.handleRefresh.bind(this)} />
        </CardText>
      </Card>
    );
  }
}

export default injectIntl(SourceCard);
