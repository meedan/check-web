import React, { Component } from 'react';
import MDEdit from 'react-icons/lib/md/edit';
import { FormattedMessage, injectIntl } from 'react-intl';
import rtlDetect from 'rtl-detect';

import {
  StyledIconButton,
} from '../styles/js/shared';

import {
  StyledProfileCard,
  StyledEditButtonWrapper,
} from '../styles/js/HeaderCard';

class HeaderCard extends Component {
  render() {
    return (
      <StyledProfileCard>
        <div>{this.props.children}</div>
        <section style={{ position: 'relative' }}>
          <StyledEditButtonWrapper>
            {this.props.canEdit && !this.props.isEditing ?
              <StyledIconButton
                isRtl={rtlDetect.isRtlLang(this.props.intl.locale)}
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
