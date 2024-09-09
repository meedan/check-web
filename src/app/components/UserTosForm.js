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
        href={stringHelper('TOS_URL')}
        rel="noopener noreferrer"
        target="_blank"
        title={this.props.intl.formatMessage(messages.tos)}
      >
        {this.props.intl.formatMessage(messages.tos)}
      </a>
    );

    const ppLink = (
      <a
        href={stringHelper('PP_URL')}
        rel="noopener noreferrer"
        target="_blank"
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
                  defaultMessage="Terms of Service and Privacy Policy"
                  description="Page title for the terms of service"
                  id="userTos.title"
                  tagName="h6"
                />
              </div> : null
            }
          </>
          :
          <div className={dialogStyles['dialog-title']}>
            <FormattedMessage
              defaultMessage="Updated Terms and Privacy Policy"
              description="Page title for the updated terms of service and privacy policy messages"
              id="userTos.titleUpdated"
              tagName="h6"
            />
          </div>
        }
        <div className={dialogStyles['dialog-content']}>
          { !this.props.user.last_accepted_terms_at ?
            <>
              { termsLastUpdatedAt ?
                <FormattedMessage
                  defaultMessage="Last updated {lastUpdated}"
                  description="Date of the last terms of service update"
                  id="userTos.termsLastUpdatedAt"
                  tagName="p"
                  values={{
                    lastUpdated: <FormattedDate day="numeric" month="long" value={termsLastUpdatedAt * 1000} year="numeric" />,
                  }}
                /> : null
              }
              <FormattedMessage
                defaultMessage="Please review our {tosLink} and our {ppLink} and consent to the following:"
                description="Message for the user to review the terms of service and privacy policy"
                id="userTos.disclaimer"
                tagName="p"
                values={{
                  tosLink,
                  ppLink,
                }}
              />
            </>
            :
            <FormattedMessage
              defaultMessage="We've updated our {tosLink} and our {ppLink}. Please review and consent to the following:"
              description="Message to the user that the terms of service and privacy policy have been updated"
              id="userTos.disclaimerUpdate"
              tagName="p"
              values={{
                tosLink,
                ppLink,
              }}
            />
          }
          <FormControlLabel
            control={
              <Checkbox
                checked={this.props.checkedTos}
                id="tos__tos-agree"
                onChange={this.props.handleCheckTos}
              />
            }
            label={
              <FormattedMessage
                defaultMessage="I agree to the Terms of Service."
                description="Checkbox label for the user to agree to the terms of service"
                id="userTos.agreeTos"
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
