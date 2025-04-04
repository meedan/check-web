import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TiplineContentTranslation from './TiplineContentTranslation';
import UploadFile from '../../UploadFile';
import settingsStyles from '../Settings.module.css';

const SmoochBotContentAndTranslation = ({
  currentLanguage,
  installation,
  onChangeImage,
  onChangeMessage,
  onChangeStateMessage,
  value,
}) => {
  let greetingImage = value.smooch_greeting_image;
  if (typeof greetingImage === 'string') {
    if (greetingImage === '' || greetingImage === 'none') {
      greetingImage = null;
    } else {
      greetingImage = { preview: greetingImage, name: greetingImage.split('/').pop() };
    }
  }

  let strings = [
    {
      key: 'smooch_message_smooch_bot_greetings',
      title: <FormattedMessage defaultMessage="Greetings" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.greetingsTitle" />,
      description: <FormattedMessage defaultMessage="The first message that is sent to the user. It introduces your organization and the service you provide through this bot." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.greetingsDescription" />,
    },
    {
      key: 'submission_prompt',
      state: 'query',
      title: <FormattedMessage defaultMessage="Content prompt" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.submissionPromptTitle" />,
      description: <FormattedMessage defaultMessage="This message prompts the user to submit content for a fact-check." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.submissionPromptDescription" />,
    },
    {
      key: 'add_more_details_state',
      title: <FormattedMessage defaultMessage="Add more content" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.moreContentPromptTitle" />,
      description: <FormattedMessage defaultMessage="This message is sent when user selects the option to add more content." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.moreContentPromptDescription" />,
    },
    {
      key: 'ask_if_ready_state',
      title: <FormattedMessage defaultMessage="Submission prompt" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.addMoreInformationTitle" />,
      description: <FormattedMessage defaultMessage="This message is sent to user after they send content, to make sure all the information they want to submit has been provided." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.addMoreInformationDescription" />,
    },
    {
      key: 'search_state',
      title: <FormattedMessage defaultMessage="Submission received" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.submissionReceivedTitle" />,
      description: <FormattedMessage defaultMessage="The confirmation sent to the user after the content is submitted." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.submissionReceivedDescription" />,
    },
    {
      key: 'search_no_results',
      title: <FormattedMessage defaultMessage="No search result" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.noSearchResultTitle" />,
      description: <FormattedMessage defaultMessage="If the bot doesn't find any relevant fact-checks in your database, it informs users that the content has been sent to journalists." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.noSearchResultDescription" />,
    },
    {
      key: 'search_result_state',
      title: <FormattedMessage defaultMessage="Feedback prompt" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.feedbackTitle" />,
      description: <FormattedMessage defaultMessage="After fact-checks are returned to the user, the bot automatically follows up to ask if the results are satisfactory." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.feedbackDescription" />,
    },
    {
      key: 'search_result_is_relevant',
      title: <FormattedMessage defaultMessage="Positive feedback" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.positiveFeedbackTitle" />,
      description: <FormattedMessage defaultMessage="If the user is satisfied, this message's purpose is to thank them for their feedback." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.positiveFeedbackDescription" />,
    },
    {
      key: 'search_submit',
      title: <FormattedMessage defaultMessage="Negative feedback" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.negativeFeedbackTitle" />,
      description: <FormattedMessage defaultMessage="If the user is not satisfied, this message informs the user that the content has been sent to journalists." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.negativeFeedbackDescription" />,
    },
    {
      key: 'newsletter_optin_optout',
      title: <FormattedMessage defaultMessage="Newsletter opt-in and opt-out" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.newsletterTitle" />,
      description: <FormattedMessage defaultMessage="This message informs user about their subscription status. You must keep the placeholders as is (do not translate content within brackets)." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.newsletterDescription" />,
    },
    {
      key: 'option_not_available',
      title: <FormattedMessage defaultMessage="Option not available" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.optionNotAvailableTitle" />,
      description: <FormattedMessage defaultMessage="The message sent if the user response is not a valid option." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.optionNotAvailableDescription" />,
    },
    {
      key: 'timeout',
      title: <FormattedMessage defaultMessage="Conversation time out" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.timeoutTitle" />,
      description: <FormattedMessage defaultMessage="After 15 minutes of inactivity, this message is sent to users to close the conversation." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.timeoutDescription" />,
    },
    {
      key: 'smooch_message_smooch_bot_disabled',
      title: <FormattedMessage defaultMessage="Inactive bot" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.noticeOfInactivityTitle" />,
      description: <FormattedMessage defaultMessage="If the tipline is set to inactive, this message is sent in response to any user message." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.noticeOfInactivityDescription" />,
    },
  ];

  const { smooch_default_messages } = installation;
  strings = strings.map(string => ({
    ...string,
    default: smooch_default_messages[currentLanguage][string.key] || smooch_default_messages.en[string.key],
  }));

  return (
    <>
      <div className={settingsStyles['setting-content-container-title']}>
        <FormattedMessage defaultMessage="Bot Content & Translations" description="Page title where users can customize the content that the tipline bot will respond with" id="smoochBotContentAndTranslation.pageTitle" />
      </div>
      { strings.map(string => (
        <TiplineContentTranslation
          defaultValue={string.default}
          description={string.description}
          error={
            string.key === 'newsletter_optin_optout' && value[string.key] && !/{subscription_status}/.test(value[string.key]) ?
              <FormattedMessage defaultMessage="The placeholder {subscription_status} is missing from your custom content or translation" description="Error message displayed on the tipline settings page when the placeholder is not present" id="smoochBotContentAndTranslation.error" />
              : null
          }
          extra={
            string.key === 'smooch_message_smooch_bot_greetings' ?
              <UploadFile
                type="image"
                value={greetingImage}
                onChange={onChangeImage}
                onError={() => {}}
              />
              : null
          }
          identifier={string.key}
          key={string.key}
          title={string.title}
          value={string.state ? value[`smooch_state_${string.state}`].smooch_menu_message : value[string.key]}
          onUpdate={(newValue) => {
            if (string.state) {
              onChangeStateMessage(string.state, newValue);
            } else {
              onChangeMessage(string.key, newValue);
            }
          }}
        />
      ))}
    </>
  );
};

SmoochBotContentAndTranslation.defaultProps = {
  value: {},
};

SmoochBotContentAndTranslation.propTypes = {
  value: PropTypes.object,
  onChangeImage: PropTypes.func.isRequired,
  onChangeMessage: PropTypes.func.isRequired,
  onChangeStateMessage: PropTypes.func.isRequired,
};

export default SmoochBotContentAndTranslation;
