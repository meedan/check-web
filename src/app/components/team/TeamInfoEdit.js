import React from 'react';
import { FormattedMessage } from 'react-intl';
import { CardActions, CardText } from 'material-ui/Card';
import Button from 'material-ui-next/Button';
import TeamAvatar from './TeamAvatar';
import UploadImage from '../UploadImage';
import globalStrings from '../../globalStrings';
import {
  StyledTwoColumns,
  StyledSmallColumn,
  StyledBigColumn,
  StyledAvatarEditButton,
} from '../../styles/js/HeaderCard';
import {
  units,
} from '../../styles/js/shared';

class TeamInfoEdit extends React.Component {
  render() {
    const { team } = this.props;

    return (
      <form onSubmit={this.handleEditTeam.bind(this)} name="edit-team-form">
        <StyledTwoColumns>
          <StyledSmallColumn>
            <TeamAvatar
              style={{ backgroundImage: `url(${avatarPreview || team.avatar})` }}
              size={units(9)}
              team={team}
            />
            {!this.state.editProfileImg ?
              <StyledAvatarEditButton className="team__edit-avatar-button">
                <Button
                  color="primary"
                  onClick={this.handleEditProfileImg.bind(this)}
                >
                  {this.props.intl.formatMessage(globalStrings.edit)}
                </Button>
              </StyledAvatarEditButton>
              : null}
          </StyledSmallColumn>

          <StyledBigColumn>
            {this.state.editProfileImg ?
              <UploadImage
                onImage={this.onImage.bind(this)}
                onClear={this.onClear.bind(this)}
                onError={this.onImageError.bind(this)}
                noPreview
              />
              : null}

            <CardText>
              <TextField
                className="team__name-input"
                id="team__name-container"
                defaultValue={team.name}
                floatingLabelText={this.props.intl.formatMessage(messages.teamName)}
                onChange={this.handleChange.bind(this, 'name')}
                fullWidth
              />

              <TextField
                className="team__description"
                id="team__description-container"
                defaultValue={team.description}
                floatingLabelText={
                  this.props.intl.formatMessage(messages.teamDescription)
                }
                onChange={this.handleChange.bind(this, 'description')}
                fullWidth
                multiLine
                rows={1}
                rowsMax={4}
              />

              <TextField
                className="team__location"
                id="team__location-container"
                defaultValue={contact ? contact.node.location : ''}
                floatingLabelText={this.props.intl.formatMessage(messages.location)}
                onChange={this.handleChange.bind(this, 'contact_location')}
                fullWidth
              />

              <TextField
                className="team__phone"
                id="team__phone-container"
                defaultValue={contact ? contact.node.phone : ''}
                floatingLabelText={this.props.intl.formatMessage(messages.phone)}
                onChange={this.handleChange.bind(this, 'contact_phone')}
                fullWidth
              />

              <TextField
                className="team__location-name-input"
                id="team__link-container"
                defaultValue={contact ? contact.node.web : ''}
                floatingLabelText={this.props.intl.formatMessage(messages.website)}
                onChange={this.handleChange.bind(this, 'contact_web')}
                fullWidth
              />
            </CardText>

            <CardActions style={{ marginTop: units(4) }}>
              <Button
                label={
                  <FormattedMessage
                    id="teamComponent.cancelButton"
                    defaultMessage="Cancel"
                  />
                }
                onClick={this.cancelEditTeam.bind(this)}
              />

              <Button
                className="team__save-button"
                label={
                  <FormattedMessage
                    id="teamComponent.saveButton"
                    defaultMessage="Save"
                    disabled={this.state.submitDisabled}
                  />
                }
                primary
                onClick={this.handleEditTeam.bind(this)}
              />
            </CardActions>
          </StyledBigColumn>
        </StyledTwoColumns>
      </form>
    );
  }
}

export default TeamInfoEdit;
