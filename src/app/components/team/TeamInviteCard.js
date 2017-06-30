import React, { Component } from 'react';
import styled from 'styled-components';
import { FormattedMessage } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Card, CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import MdPaste from 'react-icons/lib/md/content-paste';
import MdDone from 'react-icons/lib/md/done';
import config from 'config';
import {
  checkBlue,
  white,
  title,
} from '../../../../config-styles';

// TODO: Ideally we would render this SVG direct
// from a react component instead of storing it here as a string
// eg with something more like this:
// https://gist.github.com/kevinweber/3c519c32db6c976e9cbb5565dc3822f1
// ... But I could never get that to work,
// somehow the react-md svgs we used never would render correctly
// CGB 2017-6-29
const teamInviteSvg = '<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" opacity="0.2" width="24" height="24" viewBox="0 0 24 24"><path d="M16,13C15.71,13 15.38,13 15.03,13.05C16.19,13.89 17,15 17,16.5V19H23V16.5C23,14.17 18.33,13 16,13M8,13C5.67,13 1,14.17 1,16.5V19H15V16.5C15,14.17 10.33,13 8,13M8,11A3,3 0 0,0 11,8A3,3 0 0,0 8,5A3,3 0 0,0 5,8A3,3 0 0,0 8,11M16,11A3,3 0 0,0 19,8A3,3 0 0,0 16,5A3,3 0 0,0 13,8A3,3 0 0,0 16,11Z"/></svg>';

// Encode SVG for use as CSS background
// via https://codepen.io/tigt/post/optimizing-svgs-in-data-uris
function encodeSvgDataUri(svgString) {
  const parsedString = svgString.replace(/\n+/g, '');
  const uriPayload = encodeURIComponent(parsedString);
  return `data:image/svg+xml,${uriPayload}`;
}

const BackgroundImageRow = styled.div`
  background-image: url("${encodeSvgDataUri(teamInviteSvg)}");
  background-repeat: no-repeat;
  background-size: contain;
  background-position: 8px 0px;
  padding-left: 200px;
  @media all and (max-width: 600px) {
    padding-left: 100px;
    background-size: 80px;
  }
`;

const InviteCard = styled(Card)`
  background-color: ${checkBlue} !important;
  margin-bottom: 16px;
  padding-top: 0;
  p,a {
    color: ${white} !important;
  }
`;

export const InviteCardTitle = styled.h2`
  font: ${title};
  color: ${white};
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
          <BackgroundImageRow>
            <InviteCardTitle>
              <FormattedMessage
                id="teamInviteCard.title"
                defaultMessage={'Build Your Team'}
              />
            </InviteCardTitle>

            <p><FormattedMessage
              id="teamMembersComponent.inviteLink"
              defaultMessage={'To invite colleagues to join {teamName}, send them this link:'}
              values={{ teamName: this.props.team.name }}
            /></p>
            <p>{joinUrl}</p>
            <FlexRow>
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
          </BackgroundImageRow>
        </CardText>
      </InviteCard>
    );
  }
}

export default TeamInviteCard;
