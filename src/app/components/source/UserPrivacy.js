import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import rtlDetect from 'rtl-detect';
import FlatButton from 'material-ui/FlatButton';
import CheckContext from '../../CheckContext';
import { mapGlobalMessage } from '../MappedMessage';
import { stringHelper } from '../../customHelpers';
import { units } from '../../styles/js/shared';

class UserPrivacy extends Component {
  static handleSubmit(subject) {
    const email = 'privacy@meedan.com';
    window.location.href = `mailto:${email}?subject=${subject}`;
  }

  constructor(props) {
    super(props);
    this.state = {};
  }

  getCurrentUser() {
    return new CheckContext(this).getContextStore().currentUser;
  }

  render() {
    const { user } = this.props;
    const currentUser = this.getCurrentUser();

    if (!currentUser || !user || currentUser.dbid !== user.dbid) {
      return null;
    }

    const linkStyle = {
      textDecoration: 'underline',
    };

    const style = {
      margin: `${units(2)} 0`,
    };

    const cardStyle = {
      margin: `${units(2)} 0`,
    };

    const cardTextStyle = {
      display: 'flex',
      alignItems: 'center',
    };

    const isRtl = rtlDetect.isRtlLang(this.props.intl.locale);

    const direction = {
      from: isRtl ? 'right' : 'left',
      to: isRtl ? 'left' : 'right',
    };

    const buttonStyle = {
      minWidth: 300,
      textAlign: direction.to,
    };

    const appName = mapGlobalMessage(this.props.intl, 'appNameHuman');

    const ppLink = (
      <a
        target="_blank"
        rel="noopener noreferrer"
        style={linkStyle}
        href={stringHelper('PP_URL')}
      >
        <FormattedMessage id="userPrivacy.ppLink" defaultMessage="Privacy Policy" />
      </a>
    );

    return (
      <div id="user__privacy">
        <h2 style={style}>
          <FormattedMessage id="userPrivacy.title" defaultMessage="Your information" />
        </h2>
        <p style={style}>
          <FormattedMessage
            id="userPrivacy.description"
            defaultMessage="Please review our {ppLink} to learn how {appName} uses and stores your information."
            values={{
              ppLink,
              appName,
            }}
          />
        </p>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.seeInformationText"
              defaultMessage="We will send you a file with the content and data you created and generated on {appName}. This can be kept for your records or transferred to another service."
              values={{ appName }}
            />
            <FlatButton
              id="user-privacy__see-info"
              hoverColor="transparent"
              style={buttonStyle}
              label={<FormattedMessage id="userPrivacy.seeInformationButton" defaultMessage="See my information" />}
              primary
              onClick={UserPrivacy.handleSubmit.bind(this, 'Send information')}
            />
          </CardText>
        </Card>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.stopProcessingText"
              defaultMessage="You can request {appName} to stop processing your information under certain conditions."
              values={{ appName }}
            />
            <FlatButton
              id="user-privacy__stop-processing"
              hoverColor="transparent"
              style={buttonStyle}
              label={<FormattedMessage id="userPrivacy.stopProcessingButton" defaultMessage="Request to stop processing" />}
              primary
              onClick={UserPrivacy.handleSubmit.bind(this, 'Stop processing')}
            />
          </CardText>
        </Card>
        <h2 style={Object.assign({}, style, { marginTop: units(6) })}>
          <FormattedMessage id="userPrivacy.delete" defaultMessage="Delete your account" />
        </h2>
        <Card style={cardStyle}>
          <CardText style={cardTextStyle}>
            <FormattedMessage
              id="userPrivacy.deleteAccountText"
              defaultMessage="If you delete your account, your personal information will be erased. Comments, annotations, and team activity will become pseudonymous and remain on {appName}."
              values={{ appName }}
            />
            <FlatButton
              id="user-privacy__delete-account"
              hoverColor="transparent"
              style={buttonStyle}
              label={<FormattedMessage id="userPrivacy.deleteAccountButton" defaultMessage="Delete my account" />}
              primary
              onClick={UserPrivacy.handleSubmit.bind(this, 'Delete account')}
            />
          </CardText>
        </Card>
      </div>
    );
  }
}

UserPrivacy.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(UserPrivacy);
