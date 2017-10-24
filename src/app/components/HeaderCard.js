import React, { Component } from 'react';
import MDEdit from 'react-icons/lib/md/edit';
import { FormattedMessage, injectIntl } from 'react-intl';

import {
  StyledIconButton,
} from '../styles/js/shared';

import {
  StyledProfileCard,
  StyledEditButtonWrapper,
} from '../styles/js/HeaderCard';


// The "Header Card" is the layout at the top of Source, Profile and Team.
// Currently we have an actual HeaderCard component that the TeamComponent uses, but the user profile and source profile are using a selection of these constants without the HeaderCard component.
// See: styles/js/HeaderCard
// TODO: Standardize to use the HeaderCard in all three components that use this layout.
// @chris 2017-10-17

class HeaderCard extends Component {
  render() {
    return (
      <StyledProfileCard>
        <div>{this.props.children}</div>
        <section style={{ position: 'relative' }}>
          <StyledEditButtonWrapper>
            {this.props.canEdit && !this.props.isEditing ?
              <StyledIconButton
                className="team__edit-button"
                tooltip={
                  <FormattedMessage id="teamComponent.editButton" defaultMessage="Edit profile" />
                  }
                tooltipPosition="top-center"
                onTouchTap={this.props.handleEnterEditMode}
              >
                <MDEdit />
              </StyledIconButton>
              : null}
          </StyledEditButtonWrapper>
        </section>
      </StyledProfileCard>
    );
  }
}

export default injectIntl(HeaderCard);
