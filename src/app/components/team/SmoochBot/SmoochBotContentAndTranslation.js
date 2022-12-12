import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import { FormattedMessage } from 'react-intl';
import TiplineContentTranslation from '../../cds/settings-pages/TiplineContentTranslation';
import UploadFile from '../../UploadFile';

const useStyles = makeStyles(theme => ({
  container: {
    overflow: 'auto',
    paddingRight: theme.spacing(2),
    maxHeight: 'calc(100vh - 310px)',
  },
}));

const SmoochBotContentAndTranslation = ({
  value,
  onChangeMessage,
  onChangeStateMessage,
  onChangeImage,
}) => {
  const classes = useStyles();

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
      title: <FormattedMessage id="smoochBotContentAndTranslation.greetingsTitle" defaultMessage="Greetings" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.greetingsDescription" defaultMessage="The first message that is sent to the user. It introduces your organization and the service you provide through this bot." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.greetingsDefault" defaultMessage="Welcome to our fact-checking bot. Use the main menu to navigate." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'submission_prompt',
      state: 'query',
      title: <FormattedMessage id="smoochBotContentAndTranslation.submissionPromptTitle" defaultMessage="Content prompt" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.submissionPromptDescription" defaultMessage="This message prompts the user to submit content for a fact-check." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.submissionPromptDefault" defaultMessage="Please enter the question, link, picture, or video that you want to be fact-checked." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'add_more_details_state',
      title: <FormattedMessage id="smoochBotContentAndTranslation.moreContentPromptTitle" defaultMessage="Add more content" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.moreContentPromptDescription" defaultMessage="This message is sent when user selects the option to add more content." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.moreContentPromptDefault" defaultMessage="Please add more content." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'ask_if_ready_state',
      title: <FormattedMessage id="smoochBotContentAndTranslation.addMoreInformationTitle" defaultMessage="Submission prompt" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.addMoreInformationDescription" defaultMessage="This message is sent to user after they send content, to make sure all the information they want to submit has been provided." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.addMoreInformationDefault" defaultMessage="Are you ready to submit?" description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'search_state',
      title: <FormattedMessage id="smoochBotContentAndTranslation.submissionReceivedTitle" defaultMessage="Submission received" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.submissionReceivedDescription" defaultMessage="The confirmation sent to the user after the content is submitted." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.submissionReceivedDefault" defaultMessage="No fact-checks have been found. Journalists on our team have been notified and you will receive an update in this thread if the information is fact-checked." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'search_no_results',
      title: <FormattedMessage id="smoochBotContentAndTranslation.noSearchResultTitle" defaultMessage="No search result" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.noSearchResultDescription" defaultMessage="If the bot doesn't find any relevant fact-checks in your database, it informs users that the content has been sent to journalists." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.noSearchResultDefault" defaultMessage="No fact-checks have been found. Journalists on our team have been notified and you will receive an update in this thread if the information is fact-checked." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'search_result_state',
      title: <FormattedMessage id="smoochBotContentAndTranslation.feedbackTitle" defaultMessage="Feedback prompt" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.feedbackDescription" defaultMessage="After fact-checks are returned to the user, the bot automatically follows up to ask if the results are satisfactory." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.feedbackDefault" defaultMessage="Are these fact-checks answering your question?" description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'search_result_is_relevant',
      title: <FormattedMessage id="smoochBotContentAndTranslation.positiveFeedbackTitle" defaultMessage="Positive feedback" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.positiveFeedbackDescription" defaultMessage="If the user is satisfied, this message's purpose is to thank them for their feedback." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.positiveFeedbackDefault" defaultMessage="Thank you! Spread the word about this tipline to help us fight misinformation! *insert_entry_point_link*" description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'search_submit',
      title: <FormattedMessage id="smoochBotContentAndTranslation.negativeFeedbackTitle" defaultMessage="Negative feedback" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.negativeFeedbackDescription" defaultMessage="If the user is not satisfied, this message informs the user that the content has been sent to journalists." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.negativeFeedbackDefault" defaultMessage="Thank you for your feedback. Journalists on our team have been notified and you will receive an update in this thread if a new fact-check is published." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'newsletter_optin_optout',
      title: <FormattedMessage id="smoochBotContentAndTranslation.newsletterTitle" defaultMessage="Newsletter opt-in and opt-out" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.newsletterDescription" defaultMessage="This message informs user about their subscription status. You must keep the placeholders as is (do not translate content within brackets)." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.newsletterDefault" defaultMessage="Subscribe now to get the most important facts delivered directly on WhatsApp, every week. {subscription_status}." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'smooch_message_smooch_bot_option_not_available',
      title: <FormattedMessage id="smoochBotContentAndTranslation.optionNotAvailableTitle" defaultMessage="Option not available" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.optionNotAvailableDescription" defaultMessage="The message sent if the user response is not a valid option." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.optionNotAvailableDefault" defaultMessage="I'm sorry, I didn't understand your message." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'timeout',
      title: <FormattedMessage id="smoochBotContentAndTranslation.timeoutTitle" defaultMessage="Conversation time out" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.timeoutDescription" defaultMessage="After 15 minutes of activity, this message is sent to users to close the conversation." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.timeoutDefault" defaultMessage="Thank you for reaching out to us! Type any key to start a new conversation." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'smooch_message_smooch_bot_disabled',
      title: <FormattedMessage id="smoochBotContentAndTranslation.noticeOfInactivityTitle" defaultMessage="Inactive bot" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.noticeOfInactivityDescription" defaultMessage="If the tipline is set to inactive, this message is sent in response to any user message." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.noticeOfInactivityDefault" defaultMessage="Our bot is currently inactive. Please visit *insert URL* to read the latest fact-checks." description="Default value for a customizable string of the tipline bot." />,
    },
  ];

  return (
    <Box className={classes.container}>
      { strings.map(string => (
        <Box mb={4} key={string.key}>
          <TiplineContentTranslation
            key={string.key}
            identifier={string.key}
            title={string.title}
            description={string.description}
            defaultValue={string.default}
            value={string.state ? value[`smooch_state_${string.state}`].smooch_menu_message : value[string.key]}
            error={
              string.key === 'newsletter_optin_optout' && value[string.key] && !/{subscription_status}/.test(value[string.key]) ?
                <FormattedMessage id="smoochBotContentAndTranslation.error" defaultMessage="The placeholder {subscription_status} is missing from your custom content or translation" description="Error message displayed on the tipline settings page when the placeholder is not present" />
                : null
            }
            onUpdate={(newValue) => {
              if (string.state) {
                onChangeStateMessage(string.state, newValue);
              } else {
                onChangeMessage(string.key, newValue);
              }
            }}
            extra={
              string.key === 'smooch_message_smooch_bot_greetings' ?
                <Box>
                  <UploadFile
                    type="image"
                    value={greetingImage}
                    onChange={onChangeImage}
                    onError={() => {}}
                  />
                </Box>
                : null
            }
          />
        </Box>
      ))}
    </Box>
  );
};

SmoochBotContentAndTranslation.defaultProps = {
  value: {},
};

SmoochBotContentAndTranslation.propTypes = {
  value: PropTypes.object,
  onChangeMessage: PropTypes.func.isRequired,
  onChangeStateMessage: PropTypes.func.isRequired,
  onChangeImage: PropTypes.func.isRequired,
};

export default SmoochBotContentAndTranslation;
