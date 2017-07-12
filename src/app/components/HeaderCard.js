import React, { Component } from 'react';
import IconButton from 'material-ui/IconButton';
import MDEdit from 'react-icons/lib/md/edit';
import { Card } from 'material-ui/Card';
import styled from 'styled-components';
import { FormattedMessage, injectIntl } from 'react-intl';
import Can from './Can';
import {
  units,
  unitless,
  black54,
  boxShadow,
  black87,
} from '../styles/js/variables';

class HeaderCard extends Component {

  render() {
    // Define variables for styles
    const teamProfileOffset = unitless(18);
    const teamProfileBottomPad = unitless(8);
    const teamProfileFabHeight = unitless(5);

    const Container = styled(Card)`
      margin-bottom: ${units(6)};
      margin-top: -${teamProfileOffset}px;
      padding-bottom: ${teamProfileBottomPad}px;
      padding-top: ${teamProfileOffset}px;
    `;

    //  IconButton with tooltip
    const TooltipButton = styled(IconButton)`
      box-shadow: ${boxShadow(2)};
      background-color: white !important;
      border-radius: 50% !important;
      position: absolute !important;
      ${this.props.direction.to}: 80px !important;
      bottom: -${(teamProfileFabHeight * 0.5) + teamProfileBottomPad}px;

      &:hover {
        box-shadow: ${boxShadow(4)};

        svg {
          fill: ${black87} !important;
        }
      }

      svg {
        fill: ${black54} !important;
        font-size: 20px;
      }
    `;

    return (
      <Container>
        <section style={{ position: 'relative' }}>
          { this.props.children }

          {this.props.button && this.props.isEditing === false ?
            <Can permissions={this.props.permissions} permission="update Team">
              <TooltipButton
                className="team__edit-button"
                tooltip={
                  <FormattedMessage
                    id="teamComponent.editButton"
                    defaultMessage="Edit profile"
                  />
              }
                tooltipPosition="top-center"
                onTouchTap={this.props.handleEnterEditMode}
              >
                <MDEdit />
              </TooltipButton>
            </Can> : null }
        </section>
      </Container>
    );
  }
}

export default injectIntl(HeaderCard);
