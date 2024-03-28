import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedDate, defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { stringHelper } from '../customHelpers';
import dialogStyles from '../styles/css/dialog.module.css';

const messages = defineMessages({
  tos: {
    id: 'userTos.tosLink',
    defaultMessage: 'Terms of Service',
    description: 'Link text to take the user to the terms of service',
  },
  pp: {
    id: 'userTos.ppLink',
    defaultMessage: 'Privacy Policy',
    description: 'Link text to take the user to the privacy policy',
  },
});

class UserTosForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const tosLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('TOS_URL')}
        title={this.props.intl.formatMessage(messages.tos)}
      >
        {this.props.intl.formatMessage(messages.tos)}
      </a>
    );

    const ppLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={stringHelper('PP_URL')}
        title={this.props.intl.formatMessage(messages.pp)}
      >
        {this.props.intl.formatMessage(messages.pp)}
      </a>
    );

    const { termsLastUpdatedAt } = this.props;

    return (
      <>
        { !this.props.user.last_accepted_terms_at ?
          <>
            { this.props.showTitle ?
              <div className={dialogStyles['dialog-title']}>
                <FormattedMessage
                  tagName="h6"
                  id="userTos.title"
                  defaultMessage="Terms of Service and Privacy Policy"
                  description="Page title for the terms of service"
                />
              </div> : null
            }
          </>
          :
          <div className={dialogStyles['dialog-title']}>
            <FormattedMessage
              tagName="h6"
              id="userTos.titleUpdated"
              defaultMessage="Updated Terms and Privacy Policy"
              description="Page title for the updated terms of service and privacy policy messages"
            />
          </div>
        }
        <div className={dialogStyles['dialog-content']}>
          { !this.props.user.last_accepted_terms_at ?
            <>
              { termsLastUpdatedAt ?
                <FormattedMessage
                  tagName="p"
                  id="userTos.termsLastUpdatedAt"
                  defaultMessage="Last updated {lastUpdated}"
                  description="Date of the last terms of service update"
                  values={{
                    lastUpdated: <FormattedDate value={termsLastUpdatedAt * 1000} day="numeric" month="long" year="numeric" />,
                  }}
                /> : null
              }
              <FormattedMessage
                tagName="p"
                id="userTos.disclaimer"
                defaultMessage="Please review our {tosLink} and our {ppLink} and consent to the following:"
                description="Message for the user to review the terms of service and privacy policy"
                values={{
                  tosLink,
                  ppLink,
                }}
              />
            </>
            :
            <FormattedMessage
              tagName="p"
              id="userTos.disclaimerUpdate"
              defaultMessage="We've updated our {tosLink} and our {ppLink}. Please review and consent to the following:"
              description="Message to the user that the terms of service and privacy policy have been updated"
              values={{
                tosLink,
                ppLink,
              }}
            />
          }
          <FormControlLabel
            control={
              <Checkbox
                id="tos__tos-agree"
                onChange={this.props.handleCheckTos}
                checked={this.props.checkedTos}
              />
            }
            label={
              <FormattedMessage
                id="userTos.agreeTos"
                defaultMessage="I agree to the Terms of Service."
                description="Checkbox label for the user to agree to the terms of service"
              />
            }
          />
        </div>
      </>
    );
  }
}

UserTosForm.propTypes = {
  checkedTos: PropTypes.bool.isRequired,
  handleCheckTos: PropTypes.func.isRequired,
  showTitle: PropTypes.bool,
  termsLastUpdatedAt: PropTypes.number.isRequired,
  user: PropTypes.shape({
    last_accepted_terms_at: PropTypes.string,
  }).isRequired,
};

UserTosForm.defaultProps = {
  showTitle: false,
};

export default injectIntl(UserTosForm);
