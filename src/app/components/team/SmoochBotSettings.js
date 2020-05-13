import React, { Component } from 'react';
import { injectIntl, intlShape, FormattedMessage, defineMessages } from 'react-intl';
import Form from '@meedan/react-jsonschema-form-material-ui-v1';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import styled from 'styled-components';
import HelpIcon from '@material-ui/icons/HelpOutline';
import AutoCompleteMediaItem from '../media/AutoCompleteMediaItem';
import globalStrings from '../../globalStrings';
import { checkBlue } from '../../styles/js/shared';

const states = ['main', 'secondary', 'query'];

const sidebarOptions = {
  greeting: 19,
  main: 20,
  secondary: 21,
  noopt: 22,
  query: 23,
  received: 11,
  updated: 9,
  invalid: 12,
  inactivity: 17,
  tos: 18,
};

const messages = defineMessages({
  labelScenario: {
    id: 'smoochBotSettings.labelScenario',
    defaultMessage: '+ Scenario',
  },
  descIf: {
    id: 'smoochBotSettings.descIf',
    defaultMessage: 'One of the following keywords is received',
  },
  descThen: {
    id: 'smoochBotSettings.descThen',
    defaultMessage: 'Respond with',
  },
  keywordPlaceholder: {
    id: 'smoochBotSettings.keywordPlaceholder',
    defaultMessage: 'Type exact keywords, separated by commas',
  },
  greetingLabel: {
    id: 'smoochBotSettings.greetingLabel',
    defaultMessage: 'Greeting',
  },
  greetingDescription: {
    id: 'smoochBotSettings.greetingDescription',
    defaultMessage: 'The first message that is sent to the user. It introduces your organization and the service you provide through this bot. This message is automatically followed by the Main menu.',
  },
  greetingPlaceholder: {
    id: 'smoochBotSettings.greetingPlaceholder',
    defaultMessage: 'Hi! Welcome to [Name of your organization]’s fact-checking bot. We fact-check claims, videos and images related to topics such as politics, health, finance, and technology.',
  },
  mainLabel: {
    id: 'smoochBotSettings.mainLabel',
    defaultMessage: 'Main menu',
  },
  mainDescription: {
    id: 'smoochBotSettings.mainDescription',
    defaultMessage: 'A menu asking the user to choose between a set of options. This message automatically follows the Greeting message.',
  },
  mainPlaceholder: {
    id: 'smoochBotSettings.mainPlaceholder',
    defaultMessage: `📌*Main Menu*

*Reply 1* (or 🔍) to submit a request for a fact-check about an article, video, image, or other content.
*Reply 2* (or 🦠) to get the latest information about coronavirus disease (COVID-19)`,
  },
  secondaryLabel: {
    id: 'smoochBotSettings.secondaryLabel',
    defaultMessage: 'Secondary menu',
  },
  secondaryDescription: {
    id: 'smoochBotSettings.secondaryDescription',
    defaultMessage: 'An optional menu asking the user to choose from a set of options. When a user replies with one of the options, the bot can send a report or direct them to another bot message.',
  },
  secondaryPlaceholder: {
    id: 'smoochBotSettings.secondaryPlaceholder',
    defaultMessage: `*Information about Coronavirus disease (COVID-19)* 🦠

👉*Reply with any one of the following numbers (or emoji) to get information about that topic:*

*1:* How do I protect myself and/or my family? 👨‍👩‍👧
*2:* I think I might be getting sick 🤒
*3:* How can I handle stress associated with COVID-19? ❤️
*4:* Information about cases and recoveries globally 📊
*5:* Latest updates from the World Health Organization 🌐

*Reply 0* to get back to the *Main Menu* 📌`,
  },
  nooptLabel: {
    id: 'smoochBotSettings.nooptLabel',
    defaultMessage: 'Option not available',
  },
  nooptDescription: {
    id: 'smoochBotSettings.nooptDescription',
    defaultMessage: 'The message sent if the user response to a menu is not a valid menu scenario.',
  },
  nooptPlaceholder: {
    id: 'smoochBotSettings.nooptPlaceholder',
    defaultMessage: "🤖I'm sorry, I didn't understand your message. Please try again!",
  },
  queryLabel: {
    id: 'smoochBotSettings.queryLabel',
    defaultMessage: 'Query prompt',
  },
  queryDescription: {
    id: 'smoochBotSettings.queryDescription',
    defaultMessage: 'The message asking the user to submit content for a fact-check.',
  },
  queryPlaceholder: {
    id: 'smoochBotSettings.queryPlaceholder',
    defaultMessage: `*Please enter the question, link, picture, or video that you want fact-checked,* followed by any context or additional questions related to that item. Your request will be sent to fact-checkers about 30 seconds after you have sent your last message.

*Reply 0 (or 📌)* to go back to the *Main Menu* `,
  },
  receivedLabel: {
    id: 'smoochBotSettings.receivedLabel',
    defaultMessage: 'Query received',
  },
  receivedDescription: {
    id: 'smoochBotSettings.receivedDescription',
    defaultMessage: 'The confirmation sent to the user after a valid query from the user has been received.',
  },
  receivedPlaceholder: {
    id: 'smoochBotSettings.receivedPlaceholder',
    defaultMessage: `Thank you! Your request has been received. Responses are being aggregated and sorted, and we're working on fact-checking your questions.

✔️*Follow this link for an updated list of common questions that we have fact-checked:* [ Link to a page of fact-checks on your website ]

👉*Reply with any text* to get back to the *Main Menu* 📌`,
  },
  updatedLabel: {
    id: 'smoochBotSettings.updatedLabel',
    defaultMessage: 'Report updated',
  },
  updatedDescription: {
    id: 'smoochBotSettings.updatedDescription',
    defaultMessage: 'The message sent to the user when status of a report has changed. The report must be completed for this message to be sent.',
  },
  updatedPlaceholder: {
    id: 'smoochBotSettings.updatedPlaceholder',
    defaultMessage: '❗️The fact-check that we sent to you has been *updated* with new information:',
  },
  invalidLabel: {
    id: 'smoochBotSettings.invalidLabel',
    defaultMessage: 'Invalid format',
  },
  invalidDescription: {
    id: 'smoochBotSettings.invalidDescription',
    defaultMessage: 'An automatic message sent to the user when they have sent a file that is not supported by Check.',
  },
  invalidPlaceholder: {
    id: 'smoochBotSettings.invalidPlaceholder',
    defaultMessage: `❌Sorry, we can't accept this type of message for verification at this time.

We can accept most images, videos, links, text messages, and shared WhatsApp messages.`,
  },
  inactivityLabel: {
    id: 'smoochBotSettings.inactivityLabel',
    defaultMessage: 'Notice of inactivity',
  },
  inactivityDescription: {
    id: 'smoochBotSettings.inactivityDescription',
    defaultMessage: 'This message is sent to any user that has sent a message to the tipline when the Check Message bot is set to inactive.',
  },
  inactivityPlaceholder: {
    id: 'smoochBotSettings.inactivityPlaceholder',
    defaultMessage: `❌Thank you for your message. Our fact-checking service is currently *inactive.*

Contact us at *[email or other contact]* for further inquiries.`,
  },
  disabled: {
    id: 'smoochBotSettings.disabled',
    defaultMessage: 'Check this box to disable the service. This makes the Check Message bot inactive: it will reply with ONLY the message below when a user interacts with the bot.',
  },
  tosLabel: {
    id: 'smoochBotSettings.tosLabel',
    defaultMessage: 'Terms of service',
  },
  tosDescription: {
    id: 'smoochBotSettings.tosDescription',
    defaultMessage: 'This message immediately follows any report sent to the user and should contain a link to the Check Terms of Service.',
  },
  tosPlaceholder: {
    id: 'smoochBotSettings.tosPlaceholder',
    defaultMessage: 'This service is provided under the following Terms of Services: %{tos}',
  },
});

const StyledSettings = styled.div`
  .smooch-bot-settings-tabs button {
    display: block;
  }

  #smooch-bot-settings-container {
    background: #fff;
    border: 2px solid #d7d7d7;
    border-radius: 10px;
    display: flex;
    width: 100%;
  }

  #smooch-bot-settings-sidebar {
    flex-grow: 1;
    border-right: 1px solid #d7d7d7;
    padding: 30px !important;
    min-width: 230px;

    h2 {
      font-weight: bold;
      font-size: 17px;
      display: flex;
      margin-bottom: 30px;
    }
  }

  #smooch-bot-settings-form {
    flex-grow: 2;
    padding: 30px !important;
  }

  .smooch-bot-settings-sidebar-option {
    display: block !important;
    cursor: pointer;
    width: 100%;
    display: block;
    margin-bottom: 10px;
    border: 1px solid #979797;
    background: #fff;
    border-radius: 5px;
    font-size: 14px;
    color: #212121;
    padding: 16px;
    outline: 0;
    text-align: left;
  }

  #smooch-bot-settings-sidebar-option-active {
    font-weight: bold;
    border-color: #617FDB;
  }

  #smooch-bot-settings-form > div > fieldset > div {
    display: flex;

    & > div > div {
      width: 100%;
    }
  }

  #smooch-bot-settings-form > div > fieldset > div > div:last-child {
    order: -1;
    margin-bottom: 10px;
  }

  #smooch-bot-settings-form > div > fieldset > div fieldset {
    padding: 0;
    margin: 0;
    border: 0;

    & > div > div {
      margin: 0;

      & > div {
        margin: 0;
        position: relative;

        &:before, &:after {
          content: none;
        }
      }
    }

    & > div > fieldset {
      & > label {
        display: none;
      }

      & > div {
        margin: 0;
      }

      /* Add scenario */
      & > div > div > div > button {
        width: auto !important;

        &::before {
          content: "${props => props.intl.formatMessage(messages.labelScenario)}";
          display: block;
          text-transform: uppercase;
          font-weight: bold;
          font-size: 17px;
          color: #FD730C;
        }

        svg {
          display: none;
        }
      }

      /* Each scenario */
      & > div > div > div > fieldset {
        position: relative;
        margin-top: 10px;
        border: 1px solid #979797;
        border-radius: 5px;

        & > div {
          margin: 0;
          display: flex;
          flex-direction: row;

          & > div {
            flex: 1;
            padding: 10px !important;
          }

          & > div + div label {
            color: #2E77FD;
          }

          /* Resource ID field */
          & > div + div + div + div {
            display: none;
            flex: 0;
          }
        }

        & > label {
          display: none;
        }

        label {
          font-weight: bold;
          text-transform: uppercase;
          font-size: 17px;
          color: #FD730C;
          position: static;
          transition: none !important;
          transform: none !important;
        }

        & + div {
          position: absolute;
          top: 11px;
          right: 1px;
          border: 0;

          button {
            border: 0;
            color: #FBAA6D !important;
          }

          button + button + button {
            span {
              display: none;
            }

            &::before {
              content: "×";
              font-size: 34px;
              line-height: 30px;
            }
          }
        }

        .smooch-state-option-keyword {
          display: block;

          input {
            border: 1px solid #979797;
            width: 100%;
            color: #212121;
            font-size: 13px;
            font-weight: bold;
            padding: 8px 1px 9px 1px;

            &::placeholder {
              font-style: italic;
              color: #424242;
              font-weight: normal;
            }
          }

          &::before {
            content: "${props => props.intl.formatMessage(messages.descIf)}";
            font-size: 11px;
            color: #171616;
            height: auto;
            background: transparent;
            position: static;
          }
        }

        .smooch-state-option-value, .smooch-state-project-media-title {
          display: block;

          & > div > div, input {
            height: 32px;
            line-height: 32px;
            border: 1px solid #979797;
            font-size: 13px;
            color: #424242;
            background: #fff !important;
            padding: 0;
            padding-left: 2px !important;
            width: 100%;
          }

          &::before {
            content: "${props => props.intl.formatMessage(messages.descThen)}";
            font-size: 11px;
            color: #171616;
            height: auto;
            background: transparent;
            position: static;
          }
        }

        .smooch-state-project-media-title {
          input {
            font-weight: bold;
            display: inline;
            cursor: pointer;
            height: 33px;
            line-height: 33px;
            padding-right: 20px;
            box-sizing: border-box;
          }

          &::after {
            content: "×";
            color: #FBAA6D;
            height: 10px;
            width: 10px;
            position: absolute;
            font-size: 26px;
            background: transparent;
            padding: 4px;
            z-index: 1;
            right: 12px;
            top: 23px;
            width: 10px;
            left: auto;
            bottom: auto;
            transition: none;
            transform: none;
          }
        }
      }
    }
  }

  #smooch-bot-settings-form > div > fieldset > div > div.sidebar,
  #smooch-bot-settings-form > div > fieldset > div > fieldset.sidebar {
    margin: 0;

    & > div {
      width: 100%;
      margin-top: 0;

      &:before, &:after {
        content: none;
      }
    }

    textarea {
      resize: none;
      width: 100%;
      border: 1px solid #979797;
      padding: 10px;
      border-radius: 10px;
      font-size: 14px;
      min-height: 150px;
      overflow: hidden;
      box-sizing: border-box;
    }
  }
`;

class SmoochBotSettings extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: this.mergeWithDefaultData(props.formData),
      showResourceDialog: false,
      currentSelectedResource: null,
      currentState: null,
      currentIndex: null,
      showTab: 'main',
      currentSidebarOption: 'greeting',
    };
  }

  componentDidMount() {
    this.addFieldEvents();
    this.toggleFields();
  }

  componentDidUpdate(prevProps, prevState) {
    this.addFieldEvents(prevState);
    this.toggleFields();
    if (!this.state.showResourceDialog) {
      document.getElementsByTagName('BODY')[0].style.overflow = 'auto';
      document.getElementsByTagName('BODY')[0].style.paddingRight = 0;
    }
  }

  mergeWithDefaultData(propsFormData) {
    const data = Object.assign({}, propsFormData);
    const mapping = {
      smooch_message_smooch_bot_greetings: 'greeting',
      smooch_state_main: 'main',
      smooch_state_secondary: 'secondary',
      smooch_message_smooch_bot_option_not_available: 'noopt',
      smooch_state_query: 'query',
      smooch_message_smooch_bot_message_confirmed: 'received',
      smooch_message_smooch_bot_result_changed: 'updated',
      smooch_message_smooch_bot_message_type_unsupported: 'invalid',
      smooch_message_smooch_bot_disabled: 'inactivity',
      smooch_message_smooch_bot_ask_for_tos: 'tos',
    };
    Object.keys(mapping).forEach((key) => {
      if (!data[key]) {
        data[key] = this.props.intl.formatMessage(messages[`${mapping[key]}Placeholder`]);
      } else if (Object.keys(data[key]).length === 0) {
        data[key] = { smooch_menu_message: this.props.intl.formatMessage(messages[`${mapping[key]}Placeholder`]) };
      }
    });
    return data;
  }

  toggleFields() {
    // Hide all fields from the form

    const fields = document.querySelectorAll('#smooch-bot-settings-form > div > fieldset > div > *');
    let i = 0;
    fields.forEach(() => {
      fields[i].style.display = 'none';
      i += 1;
    });

    if (this.state.showTab === 'settings') {
      [0, 1, 2, 3, 4, 6, 24].forEach((index) => {
        fields[index].style.display = 'block';
      });

    // If we are viewing the "main" tab, we show the option that is selected from the sidebar
    } else if (this.state.showTab === 'main') {
      // We show the description and the label

      const index = sidebarOptions[this.state.currentSidebarOption];
      const field = fields[index];
      try {
        field.removeChild(field.querySelector('label'));
        field.querySelector('div > div').removeChild(field.querySelector('label'));
      } catch (e) {
        // Already removed
      }

      // We style the textarea and show it

      const textarea = field.querySelector('textarea');
      if (textarea) {
        const placeholder = this.props.intl.formatMessage(messages[`${this.state.currentSidebarOption}Placeholder`]);
        textarea.setAttribute('placeholder', placeholder);
        const id = `textarea-${this.state.currentSidebarOption}`;
        textarea.setAttribute('id', id);
        setTimeout(() => {
          textarea.style.height = '1px';
          textarea.style.height = `${textarea.scrollHeight}px`;
        }, 200);
      }
      field.style.display = 'block';
      field.classList.add('sidebar');

      // Special case for the "inactivity" field: besides the textarea, we also display a checkbox

      if (this.state.currentSidebarOption === 'inactivity') {
        fields[25].style.display = 'block';
        fields[25].querySelector('label > span + span').innerHTML = this.props.intl.formatMessage(messages.disabled);
      }

      // Now we style the "scenario" menus

      i = 0;
      const inputs = document.querySelectorAll('.smooch-state-option-keyword input');
      inputs.forEach(() => {
        inputs[i].setAttribute('placeholder', this.props.intl.formatMessage(messages.keywordPlaceholder));
        i += 1;
      });

      // When we select a "resource", we display the resource name instead of the select field

      states.forEach((state) => {
        const thenSelects = document.getElementsByClassName(`smooch-state-${state}-option-value`);
        const thenInputs = document.getElementsByClassName(`smooch-state-${state}-project-media-title`);
        const stateData = this.state.data;
        if (stateData[`smooch_state_${state}`].smooch_menu_options) {
          i = 0;
          stateData[`smooch_state_${state}`].smooch_menu_options.forEach((option) => {
            if (option.smooch_menu_option_value === 'resource' && option.smooch_menu_project_media_title) {
              thenSelects[i].parentNode.style.display = 'none';
              thenInputs[i].parentNode.style.display = 'block';
              thenInputs[i].onclick = () => {
                const ref = option;
                ref.smooch_menu_option_value = '';
                ref.smooch_menu_project_media_title = '';
                ref.smooch_menu_project_media_id = '';
                this.setState({ data: stateData });
              };
              thenInputs[i].querySelector('input').value = option.smooch_menu_project_media_title;
            } else {
              thenSelects[i].parentNode.style.display = 'block';
              thenInputs[i].parentNode.style.display = 'none';
            }
            i += 1;
          });
        }
      });
    }
  }

  // Display a modal to select a resource when the "resource" option is chosen from the select

  addFieldEvents(prevState) {
    if (prevState && this.state.currentState) {
      let i = 0;
      const previous = prevState.data[`smooch_state_${this.state.currentState}`].smooch_menu_options || [];
      const current = this.state.data[`smooch_state_${this.state.currentState}`].smooch_menu_options || [];
      if (
        current.filter(option => option.smooch_menu_option_value === 'resource').length >
        previous.filter(option => option.smooch_menu_option_value === 'resource').length
      ) {
        let index = -1;
        current.forEach(() => {
          if (!previous[i] || (current[i].smooch_menu_option_value === 'resource' && previous[i].smooch_menu_option_value !== 'resource')) {
            index = i;
          }
          i += 1;
        });
        if (index > -1) {
          this.displayResourceDialog(this.state.currentState, index);
        }
      }
    }
  }

  displayResourceDialog(state, i) {
    this.setState({ showResourceDialog: true, currentIndex: i });
  }

  handleOnChange(data) {
    this.setState({ data });
    this.props.onChange({ formData: data });
  }

  handleSelectResource(resource) {
    this.setState({ currentSelectedResource: resource });
  }

  handleCloseResourceDialog() {
    this.setState({
      showResourceDialog: false,
      currentSelectedResource: null,
      currentIndex: null,
    });
  }

  handleConfirmResource() {
    const data = Object.assign({}, this.state.data);
    const ref = data[`smooch_state_${this.state.currentState}`].smooch_menu_options[this.state.currentIndex];
    ref.smooch_menu_project_media_id = this.state.currentSelectedResource.value;
    ref.smooch_menu_project_media_title = this.state.currentSelectedResource.text;
    this.setState({
      data,
      showResourceDialog: false,
      currentSelectedResource: null,
      currentIndex: null,
    });
  }

  handleClickSidebarOption(optionId) {
    const state = { currentSidebarOption: optionId };
    if (states.indexOf(optionId) > -1) {
      state.currentState = optionId;
    } else {
      state.currentState = null;
    }
    this.setState(state);
  }

  handleTabChange = (e, value) => {
    this.setState({ showTab: value });
  };

  render() {
    const schema = {};
    states.forEach((state) => {
      schema[`smooch_state_${state}`] = {
        'mui:className': `smooch-state-${state}`,
        smooch_menu_message: {
          'ui:widget': 'textarea',
        },
        smooch_menu_options: {
          items: {
            smooch_menu_option_keyword: {
              'mui:className': 'smooch-state-option-keyword',
            },
            smooch_menu_option_value: {
              'mui:className': `smooch-state-option-value smooch-state-${state}-option-value`,
            },
            smooch_menu_project_media_title: {
              'mui:className': `smooch-state-project-media-title smooch-state-${state}-project-media-title`,
              'ui:options': { disabled: true },
            },
          },
        },
      };
    });
    const uiSchema = Object.assign(this.props.uiSchema, schema);

    return (
      <div id="smooch-bot-settings">
        <StyledSettings intl={this.props.intl}>
          <Tabs
            className="smooch-bot-settings-tabs"
            indicatorColor="primary"
            textColor="primary"
            value={this.state.showTab}
            onChange={this.handleTabChange}
            variant="fullWidth"
            centered
          >
            <Tab
              className="smooch-bot-settings__main-tab"
              label={
                <FormattedMessage
                  id="smoochBotSettings.main"
                  defaultMessage="Main Scenario"
                />
              }
              value="main"
            />
            <Tab
              className="smooch-bot-settings__settings-tab"
              label={
                <FormattedMessage
                  id="smoochBotSettings.settings"
                  defaultMessage="Settings"
                />
              }
              value="settings"
            />
          </Tabs>
          <div id="smooch-bot-settings-container">
            { this.state.showTab === 'main' ?
              <div id="smooch-bot-settings-sidebar">
                <h2>
                  <FormattedMessage id="smoochBotSettings.sidebarTitle" defaultMessage="Create your bot" />
                  <a href="http://help.checkmedia.org/en/articles/3872445-create-your-bot" target="_blank" rel="noopener noreferrer">
                    <HelpIcon style={{ margin: '0 10px', color: checkBlue }} />
                  </a>
                </h2>
                { Object.keys(sidebarOptions).map((optionId) => {
                  const label = this.props.intl.formatMessage(messages[`${optionId}Label`]);
                  return (
                    <button
                      key={optionId}
                      className="smooch-bot-settings-sidebar-option"
                      onClick={this.handleClickSidebarOption.bind(this, optionId)}
                      id={this.state.currentSidebarOption === optionId ? 'smooch-bot-settings-sidebar-option-active' : ''}
                    >
                      {label}
                    </button>
                  );
                })}
              </div> : null }
            <div id="smooch-bot-settings-form">
              { this.state.showTab === 'main' ?
                <p style={{ lineHeight: '1.5em' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <b>{this.props.intl.formatMessage(messages[`${this.state.currentSidebarOption}Label`])}</b>
                    { this.state.currentSidebarOption === 'invalid' ?
                      <a href="http://help.checkmedia.org/en/articles/3546268-supported-item-formats" target="_blank" rel="noopener noreferrer" style={{ display: 'flex' }}>
                        <HelpIcon style={{ margin: '0 2px', color: checkBlue }} />
                      </a> : null }
                  </span>
                  <b> - </b>
                  <span>{this.props.intl.formatMessage(messages[`${this.state.currentSidebarOption}Description`])}</span>
                </p> : null }
              <p>{this.state.currentHeader}</p>
              <Form
                schema={this.props.schema}
                uiSchema={uiSchema}
                value={this.state.data}
                onChange={this.handleOnChange.bind(this)}
              />
              <Dialog
                open={this.state.showResourceDialog}
                onClose={this.handleCloseResourceDialog.bind(this)}
                disableEnforceFocus
                fullWidth
              >
                <DialogTitle>
                  <span style={{ textTransform: 'uppercase', color: '#617FDB' }}>
                    <FormattedMessage
                      id="smoochBotSettings.dialogTitle"
                      defaultMessage="Select a report"
                    />
                  </span>
                </DialogTitle>
                <DialogContent>
                  <span style={{ color: '#171616', fontSize: 14, lineHeight: '1.5em' }}>
                    <FormattedMessage
                      id="smoochBotSettings.dialogDesc"
                      defaultMessage="Search for the title of the item that you want to send as a report. The bot will reply to the user with this report. The report must be completed before you can search for it here."
                    />
                  </span>
                  <div>
                    <AutoCompleteMediaItem
                      onlyPublished
                      media={{}}
                      onSelect={this.handleSelectResource.bind(this)}
                    />
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleCloseResourceDialog.bind(this)}>
                    {this.props.intl.formatMessage(globalStrings.cancel)}
                  </Button>
                  <Button
                    color="primary"
                    onClick={this.handleConfirmResource.bind(this)}
                  >
                    {this.props.intl.formatMessage(globalStrings.submit)}
                  </Button>
                </DialogActions>
              </Dialog>
            </div>
          </div>
        </StyledSettings>
      </div>
    );
  }
}

SmoochBotSettings.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

export default injectIntl(SmoochBotSettings);
