import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import MdLock from 'material-ui/svg-icons/action/lock';
import MdPublic from 'material-ui/svg-icons/social/public';
import MdLink from 'material-ui/svg-icons/content/link';
import MdLocation from 'material-ui/svg-icons/communication/location-on';
import MdPhone from 'material-ui/svg-icons/communication/phone';
import config from 'config'; // eslint-disable-line require-path-exists/exists
import TeamAvatar from './TeamAvatar';
import ParsedText from '../ParsedText';
import { stringHelper } from '../../customHelpers';
import UserUtil from '../user/UserUtil';
import {
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledName,
  StyledDescription,
  StyledContactInfo,
} from '../../styles/js/HeaderCard';
import {
  units,
  Row,
} from '../../styles/js/shared';

const TeamInfo = (props) => {
  const { team, context } = props;
  const contact = team.contacts.edges[0];
  const contactInfo = [];

  const handleClickUpgrade = () => {
    window.open(stringHelper('UPGRADE_URL'));
  };

  const showUpgradeButton =
    team.plan === 'free' &&
    config.appName === 'check' &&
    UserUtil.myRole(context.currentUser, team.slug) === 'owner' &&
    team.projects.edges.length &&
    team.projects.edges.find(p => p.node.medias_count > 0);

  contactInfo.push((
    <StyledContactInfo key="contactInfo.privacy" className="team__privacy">
      {team.private ? <MdLock /> : <MdPublic /> }
      <span className="team__privacy-label">
        {team.private ?
          <FormattedMessage id="teamComponent.private" defaultMessage="Private" /> :
          <FormattedMessage id="teamComponent.public" defaultMessage="Public" />
        }
      </span>
    </StyledContactInfo>
  ));

  if (contact) {
    if (contact.node.location) {
      contactInfo.push((
        <StyledContactInfo key="contactInfo.location" className="team__location">
          <MdLocation />
          <span className="team__location-name">
            <ParsedText text={contact.node.location} />
          </span>
        </StyledContactInfo>
      ));
    }

    if (contact.node.phone) {
      contactInfo.push((
        <StyledContactInfo key="contactInfo.phone" className="team__phone">
          <MdPhone />
          <span className="team__phone-name">
            <ParsedText text={contact.node.phone} />
          </span>
        </StyledContactInfo>
      ));
    }

    if (contact.node.web) {
      contactInfo.push((
        <StyledContactInfo key="contactInfo.web" className="team__web">
          <MdLink />
          <span className="team__link-name">
            <ParsedText text={contact.node.web} />
          </span>
        </StyledContactInfo>
      ));
    }
  }

  return (
    <StyledTwoColumns>
      <StyledSmallColumn>
        <TeamAvatar
          size={units(9)}
          team={team}
        />
      </StyledSmallColumn>
      <StyledBigColumn>
        <div className="team__primary-info">
          <StyledName className="team__name">
            {team.name}
          </StyledName>
          <StyledDescription>
            <ParsedText text={team.description} />
          </StyledDescription>
        </div>

        <Row>
          {contactInfo}
        </Row>
        {showUpgradeButton ?
          <Button
            variant="contained"
            color="primary"
            onClick={handleClickUpgrade}
          >
            <FormattedMessage
              id="teamComponent.upgradeButton"
              defaultMessage="Upgrade to PRO"
            />
          </Button> : null
        }
      </StyledBigColumn>
    </StyledTwoColumns>
  );
};

export default TeamInfo;
