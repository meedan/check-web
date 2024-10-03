import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import TiplineContentTranslation from './TiplineContentTranslation';
import UploadFile from '../../UploadFile';
import settingsStyles from '../Settings.module.css';

const SmoochBotContentAndTranslation = ({
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

  const strings = [
    {
      key: 'smooch_message_smooch_bot_greetings',
      title: <FormattedMessage defaultMessage="Greetings" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.greetingsTitle" />,
      description: <FormattedMessage defaultMessage="The first message that is sent to the user. It introduces your organization and the service you provide through this bot." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.greetingsDescription" />,
      default: <FormattedMessage defaultMessage="Welcome to our fact-checking bot. Use the main menu to navigate." description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.greetingsDefault" />,
    },
    {
      key: 'submission_prompt',
      state: 'query',
      title: <FormattedMessage defaultMessage="Content prompt" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.submissionPromptTitle" />,
      description: <FormattedMessage defaultMessage="This message prompts the user to submit content for a fact-check." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.submissionPromptDescription" />,
      default: <FormattedMessage defaultMessage="Please enter the question, link, picture, or video that you want to be fact-checked." description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.submissionPromptDefault" />,
    },
    {
      key: 'add_more_details_state',
      title: <FormattedMessage defaultMessage="Add more content" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.moreContentPromptTitle" />,
      description: <FormattedMessage defaultMessage="This message is sent when user selects the option to add more content." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.moreContentPromptDescription" />,
      default: <FormattedMessage defaultMessage="Please add more content." description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.moreContentPromptDefault" />,
    },
    {
      key: 'ask_if_ready_state',
      title: <FormattedMessage defaultMessage="Submission prompt" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.addMoreInformationTitle" />,
      description: <FormattedMessage defaultMessage="This message is sent to user after they send content, to make sure all the information they want to submit has been provided." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.addMoreInformationDescription" />,
      default: <FormattedMessage defaultMessage="Are you ready to submit?" description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.addMoreInformationDefault" />,
    },
    {
      key: 'search_state',
      title: <FormattedMessage defaultMessage="Submission received" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.submissionReceivedTitle" />,
      description: <FormattedMessage defaultMessage="The confirmation sent to the user after the content is submitted." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.submissionReceivedDescription" />,
      default: <FormattedMessage defaultMessage="Thank you! Looking for fact-checks, it may take a minute." description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.submissionReceivedDefault" />,
    },
    {
      key: 'search_no_results',
      title: <FormattedMessage defaultMessage="No search result" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.noSearchResultTitle" />,
      description: <FormattedMessage defaultMessage="If the bot doesn't find any relevant fact-checks in your database, it informs users that the content has been sent to journalists." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.noSearchResultDescription" />,
      default: <FormattedMessage defaultMessage="No fact-checks have been found. Journalists on our team have been notified and you will receive an update in this thread if the information is fact-checked." description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.noSearchResultDefault" />,
    },
    {
      key: 'search_result_state',
      title: <FormattedMessage defaultMessage="Feedback prompt" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.feedbackTitle" />,
      description: <FormattedMessage defaultMessage="After fact-checks are returned to the user, the bot automatically follows up to ask if the results are satisfactory." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.feedbackDescription" />,
      default: <FormattedMessage defaultMessage="Are these fact-checks answering your question?" description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.feedbackDefault" />,
    },
    {
      key: 'search_result_is_relevant',
      title: <FormattedMessage defaultMessage="Positive feedback" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.positiveFeedbackTitle" />,
      description: <FormattedMessage defaultMessage="If the user is satisfied, this message's purpose is to thank them for their feedback." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.positiveFeedbackDescription" />,
      default: <FormattedMessage defaultMessage="Thank you! Spread the word about this tipline to help us fight misinformation! *insert_entry_point_link*" description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.positiveFeedbackDefault" />,
    },
    {
      key: 'search_submit',
      title: <FormattedMessage defaultMessage="Negative feedback" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.negativeFeedbackTitle" />,
      description: <FormattedMessage defaultMessage="If the user is not satisfied, this message informs the user that the content has been sent to journalists." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.negativeFeedbackDescription" />,
      default: <FormattedMessage defaultMessage="Thank you for your feedback. Journalists on our team have been notified and you will receive an update in this thread if a new fact-check is published." description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.negativeFeedbackDefault" />,
    },
    {
      key: 'newsletter_optin_optout',
      title: <FormattedMessage defaultMessage="Newsletter opt-in and opt-out" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.newsletterTitle" />,
      description: <FormattedMessage defaultMessage="This message informs user about their subscription status. You must keep the placeholders as is (do not translate content within brackets)." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.newsletterDescription" />,
      default: <FormattedMessage defaultMessage="Subscribe now to get the most important facts delivered directly on WhatsApp, every week. {subscription_status}." description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.newsletterDefault" />,
    },
    {
      key: 'option_not_available',
      title: <FormattedMessage defaultMessage="Option not available" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.optionNotAvailableTitle" />,
      description: <FormattedMessage defaultMessage="The message sent if the user response is not a valid option." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.optionNotAvailableDescription" />,
      default: <FormattedMessage defaultMessage="I'm sorry, I didn't understand your message." description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.optionNotAvailableDefault" />,
    },
    {
      key: 'timeout',
      title: <FormattedMessage defaultMessage="Conversation time out" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.timeoutTitle" />,
      description: <FormattedMessage defaultMessage="After 15 minutes of inactivity, this message is sent to users to close the conversation." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.timeoutDescription" />,
      default: <FormattedMessage defaultMessage="Thank you for reaching out to us! Type any key to start a new conversation." description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.timeoutDefault" />,
    },
    {
      key: 'smooch_message_smooch_bot_disabled',
      title: <FormattedMessage defaultMessage="Inactive bot" description="Title of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.noticeOfInactivityTitle" />,
      description: <FormattedMessage defaultMessage="If the tipline is set to inactive, this message is sent in response to any user message." description="Description of a customizable string of the tipline bot." id="smoochBotContentAndTranslation.noticeOfInactivityDescription" />,
      default: <FormattedMessage defaultMessage="Our bot is currently inactive. Please visit *insert URL* to read the latest fact-checks." description="Default value for a customizable string of the tipline bot." id="smoochBotContentAndTranslation.noticeOfInactivityDefault" />,
    },
  ];

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
