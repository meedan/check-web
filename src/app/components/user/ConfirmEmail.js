import React from 'react';
import Relay from 'react-relay/classic';
import { FormattedMessage } from 'react-intl';
import MdInfoOutlined from '@material-ui/icons/InfoOutlined';
import styled from 'styled-components';
import ResendConfirmationMutation from '../../relay/mutations/ResendConfirmationMutation';
import SpecialBlueCard from '../layout/SpecialBlueCard';
import {
  units,
} from '../../styles/js/shared';

const svgImage = `<svg width="153px" height="119px" viewBox="0 0 153 119" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g id="300-Profile-with-no-teams" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(-958.000000, -369.000000)" fill-opacity="0.16">
      <g id="notification/single-line-snackbar" transform="translate(329.000000, 369.000000)" fill="#000000">
          <g id="notification/inverted-with-two-options">
              <g id="card--with-two-options">
                  <g id="Shape">
                      <g id="Group" transform="translate(629.218509, -26.000000)">
                          <g id="bkg-email">
                              <path d="M163.212011,17.1842797 L50.6019751,17.1842797 C42.8600352,17.1842797 36.596102,23.584661 36.596102,31.4073493 L36.5257207,116.745767 C36.5257207,124.568455 42.8600352,130.968836 50.6019751,130.968836 L163.212011,130.968836 C170.95395,130.968836 177.288265,124.568455 177.288265,116.745767 L177.288265,31.4073493 C177.288265,23.584661 170.95395,17.1842797 163.212011,17.1842797 Z M163.212011,45.6304189 L106.906993,81.1880928 L50.6019751,45.6304189 L50.6019751,31.4073493 L106.906993,66.9650233 L163.212011,31.4073493 L163.212011,45.6304189 Z" id="Shape" transform="translate(106.906993, 74.076558) rotate(-345.000000) translate(-106.906993, -74.076558) "></path>
                              <ellipse id="Oval" cx="9.04627249" cy="43" rx="7.03598972" ry="7"></ellipse>
                              <ellipse id="Oval-Copy" cx="21.1079692" cy="66" rx="7.03598972" ry="7"></ellipse>
                              <ellipse id="Oval-Copy-2" cx="7.03598972" cy="88" rx="7.03598972" ry="7"></ellipse>
                              <ellipse id="Oval-Copy-3" cx="16.0822622" cy="110" rx="7.03598972" ry="7"></ellipse>
                          </g>
                      </g>
                  </g>
              </g>
          </g>
      </g>
  </g>
</svg>`;

const StyledUserConfirmation = styled.span`
  cursor: pointer;
  display: inline-block;
  font-weight: 700;
  margin: 0 ${units(1)};
`;

// TODO Fix a11y issues
/* eslint jsx-a11y/click-events-have-key-events: 0 */
const ConfirmEmail = (props) => {
  function handleResend() {
    Relay.Store.commitUpdate(new ResendConfirmationMutation({
      user: props.user,
    }));
  }

  return (
    <SpecialBlueCard
      title={<FormattedMessage id="ConfirmEmail.title" defaultMessage="Confirm your email" />}
      icon={<MdInfoOutlined />}
      content={
        <div>
          <FormattedMessage
            id="ConfirmEmail.content"
            defaultMessage="Please check your email to verify your account."
          />
          <StyledUserConfirmation
            className="confirm-email__resend-confirmation"
            onClick={handleResend}
          >
            <FormattedMessage id="ConfirmEmail.resendConfirmation" defaultMessage="Resend" />
          </StyledUserConfirmation>
        </div>
      }
      svg={svgImage}
    />
  );
};

export default ConfirmEmail;
