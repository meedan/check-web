import React from 'react';
import { FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import MdLock from '@material-ui/icons/Lock';
import MdPublic from '@material-ui/icons/Public';
import MdLink from '@material-ui/icons/Link';
import IconEdit from '@material-ui/icons/Edit';
import MdLocation from '@material-ui/icons/LocationOn';
import MdPhone from '@material-ui/icons/Phone';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import CreateTeamDialog from './CreateTeamDialog';
import TeamAvatar from './TeamAvatar';
import Can from '../Can';
import ParsedText from '../ParsedText';
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
  SmallerStyledIconButton,
} from '../../styles/js/shared';

const TeamInfo = (props) => {
  const { team } = props;
  const [showDuplicateTeamDialog, setShowDuplicateTeamDialog] = React.useState(false);
  const contact = team.contacts.edges[0];
  const contactInfo = [];

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
        <Box display="flex" justifyContent="space-between">
          <div>
            <div className="team__primary-info">
              <StyledName className="team__name">
                <Row>
                  {team.name}
                  <Can permissions={team.permissions} permission="update Team">
                    <SmallerStyledIconButton
                      className="team-menu__edit-team-button"
                      onClick={() => browserHistory.push(`/${props.team.slug}/edit`)}
                      tooltip={
                        <FormattedMessage id="teamInfo.editTeam" defaultMessage="Edit" />
                      }
                    >
                      <IconEdit />
                    </SmallerStyledIconButton>
                  </Can>
                </Row>
              </StyledName>
              <StyledDescription>
                <ParsedText text={team.description} />
              </StyledDescription>
            </div>
            <Row>
              {contactInfo}
            </Row>
          </div>
          <div>
            <Can permissions={team.permissions} permission="duplicate Team">
              <Button
                color="primary"
                variant="contained"
                onClick={() => setShowDuplicateTeamDialog(true)}
              >
                <FormattedMessage id="teamInfo.duplicateTeam" defaultMessage="Duplicate" />
              </Button>
            </Can>
          </div>
        </Box>
      </StyledBigColumn>
      { showDuplicateTeamDialog ?
        <CreateTeamDialog onDismiss={() => setShowDuplicateTeamDialog(false)} team={team} /> :
        null
      }
    </StyledTwoColumns>
  );
};

export default TeamInfo;
