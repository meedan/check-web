import React from 'react';
import { FormattedHTMLMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import PropTypes from 'prop-types';

const messages = defineMessages({
  adult: {
    id: 'contentScreen.adult',
    defaultMessage: 'Adult',
    description: 'Content warning type: Adult',
  },
  medical: {
    id: 'contentScreen.medical',
    defaultMessage: 'Medical',
    description: 'Content warning type: Medical',
  },
  spam: {
    id: 'contentScreen.spam',
    defaultMessage: 'Spam',
    description: 'Content warning type: Spam',
  },
  violence: {
    id: 'contentScreen.violence',
    defaultMessage: 'Violence',
    description: 'Content warning type: Violence',
  },
});

const ContentWarningMessage = ({
  intl,
  warningCategory,
  warningCreator,
}) => {
  let message;
  if (warningCreator === 'Alegre') {
    message = (
      <FormattedHTMLMessage
        defaultMessage="An automation rule has detected this content as sensitive"
        description="Content warning displayed over sensitive content detected by an automation rule"
        id="contentScreen.warningByAutomationRule"
        tagName="p"
      />
    );
  } else if (warningCreator === 'Smooch' || !warningCreator) {
    message = (
      <FormattedHTMLMessage
        defaultMessage="This content has been flagged as <strong>SPAM</strong> because the user was blocked due to sending excessive messages."
        description="Content warning displayed over sensitive content flagged as SPAM by Smooch Bot"
        id="contentScreen.warningBySmoochBot"
        tagName="p"
      />
    );
  } else {
    message = (
      <FormattedHTMLMessage
        defaultMessage="<strong>{user_name}</strong> has detected this content as <strong>{warning_category}</strong>"
        description="Content warning displayed over sensitive content detected by a specific user"
        id="contentScreen.warning"
        tagName="p"
        values={{
          user_name: warningCreator,
          warning_category: (
            (messages[warningCategory] && intl.formatMessage(messages[warningCategory])) ||
            warningCategory
          ),
        }}
      />
    );
  }

  return message;
};

ContentWarningMessage.propTypes = {
  intl: intlShape.isRequired,
  warningCategory: PropTypes.string,
  warningCreator: PropTypes.string,
};

ContentWarningMessage.defaultProps = {
  warningCreator: '',
  warningCategory: '',
};

export default injectIntl(ContentWarningMessage);
