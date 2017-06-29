import React, { Component, PropTypes } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Card, CardTitle, CardActions, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import MdPaste from 'react-icons/lib/md/content-paste';
import MdDone from 'react-icons/lib/md/done';

import {
  checkBlue,
  white,
} from '../../../../config-styles';

const InviteCard = styled(Card)`
  margin-bottom: 16px;
  padding-top: 16px;
  background: ${checkBlue} !important;
  p,a {
    color: ${white} !important;
  }
`;

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  p {
    margin-bottom: 0;
  }
`;

class TeamInviteCard extends Component {
  constructor(props) {
    super(props);
    this.state = { copyValue: '', copied: false };
  }

  render() {
    const teamUrl = `${window.location.protocol}//${config.selfHost}/${this.props.team.slug}`;
    const joinUrl = `${teamUrl}/join`;

    return (
      <InviteCard>
        <CardText>
          <div>
            <p>
              <FormattedMessage
                id="teamMembersComponent.inviteLink"
                defaultMessage={'To invite colleagues to join {teamName}, send them this link:'}
                values={{ teamName: this.props.team.name }}
              />
            </p>
            <FlexRow>
              <p>{joinUrl}</p>
              <CopyToClipboard
                text={joinUrl}
                onCopy={() => this.setState({ copied: true })}
              >
                {this.state.copied ? <RaisedButton
                  icon={<MdDone />} label={<FormattedMessage
                    id="teamInviteCard.copy"
                    defaultMessage={'COPIED'}
                  />}
                /> : <RaisedButton
                  icon={<MdPaste />} label={<FormattedMessage
                    id="teamInviteCard.copied"
                    defaultMessage={'COPY'}
                  />}
                />}
              </CopyToClipboard>
            </FlexRow>
          </div>
        </CardText>
      </InviteCard>
    );
  }
}

export default TeamInviteCard;
