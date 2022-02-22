import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Box from '@material-ui/core/Box';
import { injectIntl, intlShape, defineMessages, FormattedMessage } from 'react-intl';
import TextField from '@material-ui/core/TextField';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import { labelsV2 } from './localizables';
import { opaqueBlack23 } from '../../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  defaultString: {
    borderTopLeftRadius: theme.spacing(0.5),
    borderTopRightRadius: theme.spacing(0.5),
    border: `1px solid ${opaqueBlack23}`,
    borderBottom: 0,
    background: '#F6F6F6',
  },
  customString: {
    borderTop: 0,
    outline: 0,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    fontSize: '0.875rem',
  },
  error: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
  },
}));

const messages = defineMessages({
  placeholder: {
    id: 'smoochBotContentAndTranslation.placeholder',
    defaultMessage: 'Type custom content or translation here.',
    description: 'Placeholder used in all fields under tipline content and translation settings.',
  },
});

const SmoochBotContentAndTranslation = ({
  value,
  onChangeMessage,
  onChangeStateMessage,
  intl,
}) => {
  const classes = useStyles();

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
      title: <FormattedMessage id="smoochBotContentAndTranslation.submissionPromptTitle" defaultMessage="Submission prompt" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.submissionPromptDescription" defaultMessage="The message asking the user to submit content for a fact-check." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.submissionPromptDefault" defaultMessage="Please enter the question, link, picture, or video that you want to be fact-checked." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'cancelled',
      title: <FormattedMessage id="smoochBotContentAndTranslation.submissionCanceledTitle" defaultMessage="Submission canceled" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.submissionCanceledDescription" defaultMessage="This message is sent when user cancels the submission of content." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.submissionCanceledDefault" defaultMessage="OK! Your submission is canceled." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'ask_if_ready_state',
      title: <FormattedMessage id="smoochBotContentAndTranslation.addMoreInformationTitle" defaultMessage="Add more information" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.addMoreInformationDescription" defaultMessage="This message is sent to user after they send content, to make sure all the information they want to submit has been provided." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.addMoreInformationDefault" defaultMessage="Are you ready to submit?" description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'add_more_details_state',
      title: <FormattedMessage id="smoochBotContentAndTranslation.moreContentPromptTitle" defaultMessage="More content prompt" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.moreContentPromptDescription" defaultMessage="This message is sent when user selects the option to add more content." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.moreContentPromptDefault" defaultMessage="Please add more content." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'search_state',
      title: <FormattedMessage id="smoochBotContentAndTranslation.submissionReceivedTitle" defaultMessage="Submission received" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.submissionReceivedDescription" defaultMessage="The confirmation sent to the user after a valid query from the user has been received, while the bot is retrieving content." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.submissionReceivedDefault" defaultMessage="Thank you! Looking for fact-checks, it may take a minute." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'search_no_results',
      title: <FormattedMessage id="smoochBotContentAndTranslation.noSearchResultTitle" defaultMessage="No search result" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.noSearchResultDescription" defaultMessage="If the bot doesn't find any relevant fact-checks in your database, it informs users that the content has been sent to journalists." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.noSearchResultDefault" defaultMessage="No fact-checks have been found. Journalists on our team have been notified and you will receive an update in this thread if the information is fact-checked." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'search_result_state',
      title: <FormattedMessage id="smoochBotContentAndTranslation.feedbackTitle" defaultMessage="Feedback" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.feedbackDescription" defaultMessage="When fact-checks are returned to the user, the bot automatically follows up to ask if the results are satisfactory." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.feedbackDefault" defaultMessage="Are these fact-checks answering your question?" description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'search_submit',
      title: <FormattedMessage id="smoochBotContentAndTranslation.negativeFeedbackTitle" defaultMessage="Negative feedback" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.negativeFeedbackDescription" defaultMessage="If the user is not satisfied, this message informs the user that the content has been sent to journalists." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.negativeFeedbackDefault" defaultMessage="Thank you for your feedback. Journalists on our team have been notified and you will receive an update in this thread if a new fact-check is published." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'search_result_is_relevant',
      title: <FormattedMessage id="smoochBotContentAndTranslation.positiveFeedbackTitle" defaultMessage="Positive feedback" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.positiveFeedbackDescription" defaultMessage="If the user is satisfied, this message's purpose is to thank them for their feedback." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.positiveFeedbackDefault" defaultMessage="Thank you! Spread the word about this tipline to help us fight misinformation! *insert_entry_point_link*" description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'newsletter_optin_optout',
      title: <FormattedMessage id="smoochBotContentAndTranslation.newsletterTitle" defaultMessage="Newsletter opt-in and opt-out" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.newsletterDescription" defaultMessage="This message informs user about their subscription status. You must keep the placeholders as is (do not translate content within brackets)." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.newsletterDefault" defaultMessage="Subscribe now to get the most important facts delivered directly on WhatsApp, every week. {subscription_status}." description="Default value for a customizable string of the tipline bot." />,
    },
    {
      key: 'smooch_message_smooch_bot_disabled',
      title: <FormattedMessage id="smoochBotContentAndTranslation.noticeOfInactivityTitle" defaultMessage="Notice of inactivity" description="Title of a customizable string of the tipline bot." />,
      description: <FormattedMessage id="smoochBotContentAndTranslation.noticeOfInactivityDescription" defaultMessage="This message is sent to any user that has sent a message to the tipline when the Check Message bot is set to inactive." description="Description of a customizable string of the tipline bot." />,
      default: <FormattedMessage id="smoochBotContentAndTranslation.noticeOfInactivityDefault" defaultMessage="Our bot is currently inactive. Please visit *insert URL* to read the latest fact-checks." description="Default value for a customizable string of the tipline bot." />,
    },
  ];

  return (
    <React.Fragment>
      <Typography variant="subtitle2" component="div">{labelsV2.smooch_content}</Typography>

      <Typography component="div" variant="body2">
        <FormattedMessage
          id="smoochBotContentAndTranslation.subtitle"
          defaultMessage="Replace or translate the default content for each standard bot message."
          description="Subtitle displayed in tipline settings page for content and translation."
        />
      </Typography>

      { strings.map((string, i) => (
        <Box my={2}>
          <Typography component="div" variant="body2">
            <strong>{i + 1}. {string.title}</strong><br />
            {string.description}
          </Typography>
          { string.key === 'newsletter_optin_optout' && !/{subscription_status}/.test(value[string.key]) ?
            <Typography variant="body2" component="div" color="error" className={classes.error}>
              <InfoOutlinedIcon />
              {' '}
              <FormattedMessage id="smoochBotContentAndTranslation.error" defaultMessage="The placeholder \{subscription_status\} is missing from your custom content or translation" description="Error message displayed on the tipline settings page when the placeholder is not present" />
            </Typography> : null }
          <Box mt={1}>
            <Box p={1} className={classes.defaultString}>
              <Typography component="div" variant="body2">
                {string.default}
              </Typography>
            </Box>
            <TextField
              key={string.key}
              InputProps={{ className: classes.customString }}
              variant="outlined"
              placeholder={intl.formatMessage(messages.placeholder)}
              rowsMax={Infinity}
              rows={3}
              defaultValue={string.state ? value[`smooch_state_${string.state}`].smooch_menu_message : value[string.key]}
              onBlur={(e) => {
                const newValue = e.target.value;
                if (string.state) {
                  onChangeStateMessage(string.state, newValue);
                } else {
                  onChangeMessage(string.key, newValue);
                }
              }}
              error={string.key === 'newsletter_optin_optout' && !/{subscription_status}/.test(value[string.key])}
              multiline
              fullWidth
            />
          </Box>
        </Box>
      ))}
    </React.Fragment>
  );
};

SmoochBotContentAndTranslation.defaultProps = {
  value: {},
};

SmoochBotContentAndTranslation.propTypes = {
  value: PropTypes.object,
  onChangeMessage: PropTypes.func.isRequired,
  onChangeStateMessage: PropTypes.func.isRequired,
  intl: intlShape.isRequired,
};

export default injectIntl(SmoochBotContentAndTranslation);
