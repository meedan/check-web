import React from 'react';
import { FormattedMessage, defineMessages } from 'react-intl';

const labels = {
  smooch_settings: <FormattedMessage defaultMessage="Platforms" description="Label for the bot platform settings area" id="smoochBot.labelSettings" />,
  smooch_main_menu: <FormattedMessage defaultMessage="Main Menu" description="Label for the bot Main menu content area" id="smoochBot.labelMainMenu" />,
  smooch_content: <FormattedMessage defaultMessage="Content & Translation" description="Button label in tipline settings page" id="smoochBot.labelContent" />,
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
});

export {
  labels,
  placeholders,
};
