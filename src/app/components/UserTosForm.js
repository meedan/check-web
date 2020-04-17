import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import { units } from '../styles/js/shared';
import { stringHelper } from '../customHelpers';

class UserTosForm extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const linkStyle = {
      textDecoration: 'underline',
    };

    const tosLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        href={stringHelper('TOS_URL')}
      >
        <FormattedMessage id="userTos.tosLink" defaultMessage="Terms of Service" />
      </a>
    );

    const ppLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        href={stringHelper('PP_URL')}
      >
        <FormattedMessage id="userTos.ppLink" defaultMessage="Privacy Policy" />
      </a>
    );

    return (
      <div>
        { !this.props.user.last_accepted_terms_at ?
          <div>
            { this.props.showTitle ?
              <h2>
                <FormattedMessage
                  id="userTos.title"
                  defaultMessage="Terms of Service and Privacy Policy"
                />
              </h2> : null }
            <p style={{ margin: `${units(4)} 0` }}>
              <FormattedMessage
                id="userTos.disclaimer"
                defaultMessage="Please review our {tosLink} and our {ppLink} and consent to the following:"
                values={{
                  tosLink,
                  ppLink,
                }}
              />
            </p>
          </div> :
          <div>
            <h2>
              <FormattedMessage
                id="userTos.titleUpdated"
                defaultMessage="Updated Terms and Privacy Policy"
              />
            </h2>
            <p style={{ margin: `${units(4)} 0` }}>
              <FormattedMessage
                id="userTos.disclaimerUpdate"
                defaultMessage="We've updated our {tosLink} and our {ppLink}. Please review and consent to the following:"
                values={{
                  tosLink,
                  ppLink,
                }}
              />
            </p>
          </div>
        }
        <div style={{ margin: `${units(4)} 0` }}>
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
              />
            }
          />
        </div>
        <div style={{ margin: `${units(4)} 0` }}>
          <FormControlLabel
            control={
              <Checkbox
                id="tos__pp-agree"
                onChange={this.props.handleCheckPp}
                checked={this.props.checkedPp}
              />
            }
            label={
              <FormattedMessage
                id="userTos.agreePp"
                defaultMessage="I agree that Meedan may process personal information I choose to share, including information revealing my racial or ethnic origin, political opinions, religious or philosophical beliefs, trade-union membership, photographs, or information on my sexual orientation. Such information will be deleted if I delete my account as stated in the Privacy Policy."
              />
            }
          />
        </div>
      </div>
    );
  }
}

export default UserTosForm;
