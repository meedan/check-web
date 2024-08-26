import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';
import Box from '@material-ui/core/Box';

const labels = {
  smooch_message_smooch_bot_greetings: <FormattedMessage defaultMessage="Greeting" description="Label for the bot Greeting content area" id="smoochBot.labelGreeting" />,
  smooch_state_main: <FormattedMessage defaultMessage="Main menu" description="Label for the bot Main menu content area" id="smoochBot.labelMainMenu" />,
  smooch_state_secondary: <FormattedMessage defaultMessage="Secondary menu" description="Label for the bot Secondary menu content area" id="smoochBot.labelSecondaryMenu" />,
  smooch_state_query: <FormattedMessage defaultMessage="Query prompt" description="Label for the bot Query prompt content area" id="smoochBot.labelQueryPrompt" />,
  smooch_message_smooch_bot_message_confirmed: <FormattedMessage defaultMessage="Query received" description="Label for the bot Query received content area" id="smoochBot.labelQueryReceived" />,
  smooch_state_subscription: <FormattedMessage defaultMessage="Subscription opt-in" description="Label for the bot Query Subscription opt-in content area" id="smoochBot.labelSubscription" />,
  smooch_message_smooch_bot_option_not_available: <FormattedMessage defaultMessage="Option not available" description="Label for the bot Option not available content area" id="smoochBot.labelOptionNotAvailable" />,
  smooch_message_smooch_bot_result_changed: <FormattedMessage defaultMessage="Report updated" description="Label for the bot Report updated content area" id="smoochBot.labelReportUpdated" />,
  smooch_message_smooch_bot_message_type_unsupported: <FormattedMessage defaultMessage="Invalid format" description="Label for the bot Invalid format content area" id="smoochBot.labelInvalidFormat" />,
  smooch_message_smooch_bot_disabled: <FormattedMessage defaultMessage="Notice of inactivity" description="Label for the bot Notice of inactivity content area" id="smoochBot.labelInactive" />,
  smooch_message_smooch_bot_tos: <FormattedMessage defaultMessage="Privacy Statement" description="Label for the bot Privacy statement content area" id="smoochBot.labelPrivacyStatement" />,
};

const labelsV2 = {
  smooch_content: <FormattedMessage defaultMessage="Content & translation" description="Button label in tipline settings page" id="smoochBot.labelContent" />,
  smooch_main_menu: <FormattedMessage defaultMessage="Main menu" description="Label for the bot Main menu content area" id="smoochBot.labelMainMenu" />,
};

const descriptions = {
  smooch_message_smooch_bot_greetings: <FormattedMessage defaultMessage="The first message that is sent to the user. It introduces your organization and the service you provide through this bot." description="Definition of the bot Greeting content" id="smoochBot.descriptionGreeting" />,
  smooch_state_main: <FormattedMessage defaultMessage="A menu asking the user to choose between a set of options. This message automatically follows the Greeting message. 9 cannot be used as an option in the main menu." description="Definition of the bot Main menu content" id="smoochBot.descriptionMainMenu" />,
  smooch_state_secondary: <FormattedMessage defaultMessage="An optional menu asking the user to choose from a set of options. When a user replies with one of the options, the bot can send a report or direct them to another bot message." description="Definition of the bot Secondary menu content" id="smoochBot.descriptionSecondaryMenu" />,
  smooch_state_query: <FormattedMessage defaultMessage="The message asking the user to submit content for a fact-check." description="Definition of the bot Query prompt content" id="smoochBot.descriptionQueryPrompt" />,
  smooch_message_smooch_bot_message_confirmed: <FormattedMessage defaultMessage="The confirmation sent to the user after a valid query from the user has been received." description="Definition of the bot Query received content" id="smoochBot.descriptionQueryReceived" />,
  smooch_state_subscription: <FormattedMessage defaultMessage="Present the value of your newsletter to users. All users who opt-in will receive any future newsletter." description="Definition of the bot Subscription content" id="smoochBot.descriptionSubscription" />,
  smooch_message_smooch_bot_option_not_available: <FormattedMessage defaultMessage="The message sent if the user response to a menu is not a valid menu scenario." description="Definition of the bot Option not available content" id="smoochBot.descriptionOptionNotAvailable" />,
  smooch_message_smooch_bot_result_changed: <FormattedMessage defaultMessage="The message sent to the user when status of a report has changed. The report must be completed for this message to be sent." description="Definition of the bot Report updated content" id="smoochBot.descriptionReportUpdated" />,
  smooch_message_smooch_bot_message_type_unsupported: <FormattedMessage defaultMessage="An automatic message sent to the user when they have sent a file that is not supported by Check." description="Definition of the bot Invalid format content" id="smoochBot.descriptionInvalidFormat" />,
  smooch_message_smooch_bot_disabled: <FormattedMessage defaultMessage="This message is sent to any user that has sent a message to the tipline when the Check Message bot is set to inactive." description="Definition of the bot Inactive content" id="smoochBot.descriptionInactive" />,
  smooch_message_smooch_bot_tos_greeting: (
    <React.Fragment>
      <FormattedMessage defaultMessage="By default, the following Privacy Statement is available to all users. When replacing it with a custom one, you must do so for each language your bot is active in." description="Description of the requirement of the privacy statement in regards to translations" id="smoochBot.descriptionPrivacyStatementGreeting" />
      <br /><br />
      <FormattedMessage defaultMessage="The option '9' must be referenced for users to access the Privacy Statement on the Main menu." description="Description of a greeting requirement of a menu option number that must be used for the privacy statement" id="smoochBot.descriptionPrivacyStatementGreeting2" />
    </React.Fragment>
  ),
  smooch_message_smooch_bot_tos_content: <FormattedMessage defaultMessage="Privacy Statement content. Edit the text below, or replace it with custom content." description="Description of the privacy statement content and how to use custom text" id="smoochBot.descriptionPrivacyStatementContent" />,
};

const footnotes = {
  smooch_message_smooch_bot_greetings: (
    <React.Fragment>
      <Box mt={2}>
        <FormattedMessage defaultMessage="The following statement and option will be automatically added at the end of this message: 'We will never share your personally identifiable information. Reply 9 to read our Privacy and Purpose statement'." description="Description of what extra content will be appended to the footer of messages" id="smoochBot.footnoteGreeting" />
      </Box>
      <Box my={2}>
        <FormattedMessage defaultMessage="The default Privacy Statement can be replaced with a custom one under the option 'Privacy Statement' on this page." description="Description of how to replace the privacy statement content with custom content" id="smoochBot.footnoteGreeting2" />
      </Box>
    </React.Fragment>
  ),
};

const placeholders = defineMessages({
  smooch_message_smooch_bot_greetings: {
    id: 'smoochBot.placeholderGreeting',
    defaultMessage: 'Hi! Welcome to [Name of your organization]’s fact-checking bot.',
  },
  smooch_state_main: {
    id: 'smoochBot.placeholderMainMenu',
    defaultMessage: `📌*Main Menu*

*Reply 1* (or 🔍) to submit a request for a fact-check about an article, video, image, or other content.
*Reply 2* (or 🦠) to get the latest information about coronavirus disease (COVID-19)`,
  },
  smooch_state_secondary: {
    id: 'smoochBot.placeholderSecondaryMenu',
    defaultMessage: `*Information about Coronavirus disease (COVID-19)* 🦠

👉*Reply with any one of the following numbers (or emoji) to get information about that topic:*

*1:* How do I protect myself and/or my family? 👨‍👩‍👧
*2:* I think I might be getting sick 🤒
*3:* How can I handle stress associated with COVID-19? ❤️
*4:* Information about cases and recoveries globally 📊
*5:* Latest updates from the World Health Organization 🌐

*Reply 0* to get back to the *Main Menu* 📌`,
  },
  smooch_state_query: {
    id: 'smoochBot.placeholderQueryPrompt',
    defaultMessage: `*Please enter the question, link, picture, video or audio that you want fact-checked,* followed by any context related to that item. Your request will be sent to fact-checkers about 15 seconds after your last message.

*Reply 0 (or 📌)* to cancel and go back to the *Main Menu*`,
  },
  smooch_message_smooch_bot_message_confirmed: {
    id: 'smoochBot.placeholderQueryReceived',
    defaultMessage: `Thank you! Your request has been received. Responses are being aggregated and sorted, and we're working on fact-checking your questions.

✔️*Follow this link for an updated list of common questions that we have fact-checked:* [ Link to a page of fact-checks on your website ]

👉*Reply with any text* to get back to the *Main Menu* 📌`,
  },
  smooch_state_subscription: {
    id: 'smoochBot.placeholderSubscription',
    defaultMessage: 'Type to compose your prompt for newsletter opt-in.',
  },
  smooch_message_smooch_bot_option_not_available: {
    id: 'smoochBot.placeholderOptionNotAvailable',
    defaultMessage: "🤖I'm sorry, I didn't understand your message. Please try again!",
  },
  smooch_message_smooch_bot_result_changed: {
    id: 'smoochBot.placeholderReportUpdated',
    defaultMessage: '❗️The fact-check that we sent to you has been *updated* with new information:',
  },
  smooch_message_smooch_bot_message_type_unsupported: {
    id: 'smoochBot.placeholderInvalidFormat',
    defaultMessage: `❌Sorry, we can't accept this type of message for verification at this time.

We can accept most images, videos, links, text messages, and shared WhatsApp messages.`,
  },
  smooch_message_smooch_bot_disabled: {
    id: 'smoochBot.placeholderInactive',
    defaultMessage: `❌Thank you for your message. Our fact-checking service is currently *inactive.*

Contact us at *[email or other contact]* for further inquiries.`,
  },
  default_new_resource_title: {
    id: 'smoochBot.newResourceTitle',
    defaultMessage: 'New bot resource',
  },
  menu_keywords: {
    id: 'smoochBot.menuKeywords',
    defaultMessage: 'Keywords separated by comma',
  },
  tos: {
    id: 'smoochBot.tos',
    defaultMessage: 'Terms of Service ({language})',
  },
});

export {
  labels,
  labelsV2,
  descriptions,
  placeholders,
  footnotes,
};
