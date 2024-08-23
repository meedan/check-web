import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import Tooltip from './cds/alerts-and-prompts/Tooltip';
import { FlashMessageSetterContext } from './FlashMessage';
import GenericUnknownErrorMessage from './GenericUnknownErrorMessage';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import LimitedTextArea from './layout/inputs/LimitedTextArea';
import { getErrorMessageForRelayModernProblem } from '../helpers';
import IconClose from '../icons/clear.svg';
import SendIcon from '../icons/send.svg';
import styles from '../styles/css/dialog.module.css';
import inputStyles from '../styles/css/inputs.module.css';

const SendTiplineMessage = ({ annotationId, channel, username }) => {
  const [text, setText] = React.useState();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const [submitDisabled, setSubmitDisabled] = React.useState(true);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const submitMessage = (inReplyToId, message) => {
    setIsSending(true);

    const onSuccess = () => {
      setIsSending(false);
      setDialogOpen(false);
      setText('');
      setFlashMessage(
        <FormattedMessage
          defaultMessage="Message sent"
          description="Banner displayed when message is sent to tipline user successfully"
          id="sendTiplineMessage.success"
        />,
        'success',
      );
    };
    const onFailure = (error) => {
      const errorMessage = getErrorMessageForRelayModernProblem(error) || <GenericUnknownErrorMessage />;
      setFlashMessage(errorMessage, 'error');
      setIsSending(false);
    };

    commitMutation(Relay.Store, {
      mutation: graphql`
        mutation SendTiplineMessageSendMutation($input: SendInput!) {
          sendTiplineMessage(input: $input) {
            success
          }
        }
      `,
      variables: {
        input: {
          inReplyToId,
          message,
        },
      },
      onCompleted: onSuccess,
      onError: onFailure,
    });
  };

  const handleChange = (e) => {
    const value = e.target.value.trim();
    setSubmitDisabled(value.length === 0);
  };

  return (
    <>
      <Tooltip
        arrow
        title={
          <FormattedMessage
            defaultMessage="Send message to {username} on {channel}"
            description="Tooltip for messaging popup"
            id="sendTiplineMessage.tooltip"
            values={{
              username,
              channel,
            }}
          />
        }
      >
        <span>
          <ButtonMain
            className="send-tipline-message__button"
            iconCenter={<SendIcon />}
            size="default"
            theme="text"
            variant="outlined"
            onClick={() => setDialogOpen(true)}
          />
        </span>
      </Tooltip>
      { dialogOpen ?
        <Dialog
          className={styles['dialog-window']}
          fullWidth
          open
        >
          <div className={styles['dialog-title']}>
            <FormattedMessage
              defaultMessage="Send message to {username} on {channel}"
              description="Title for messaging popup"
              id="sendTiplineMessage.title"
              tagName="h6"
              values={{
                username,
                channel,
              }}
            />
            <ButtonMain
              className={styles['dialog-close-button']}
              iconCenter={<IconClose />}
              size="small"
              theme="text"
              variant="text"
              onClick={() => setDialogOpen(false)}
            />
          </div>
          <div className={styles['dialog-content']}>
            <div className={inputStyles['form-fieldset']}>
              <div className={inputStyles['form-fieldset-field']}>
                <FormattedMessage
                  defaultMessage="Write a message to {username} on {channel}"
                  description="Placeholder for message authoring field"
                  id="sendTiplineMessage.placeholder"
                  values={{
                    username,
                    channel,
                  }}
                >
                  { placeholder => (
                    <LimitedTextArea
                      label={
                        <FormattedMessage
                          defaultMessage="Message"
                          description="Message input label"
                          id="sendTiplineMessage.inputLabel"
                        />
                      }
                      maxChars={800}
                      maxlength="800"
                      placeholder={placeholder}
                      setValue={m => setText(m)}
                      value={text}
                      onChange={handleChange}
                    />
                  )}
                </FormattedMessage>
              </div>
            </div>
          </div>
          <div className={styles['dialog-actions']}>
            <ButtonMain
              className="send-tipline-message__cancel-button"
              label={
                <FormattedMessage
                  defaultMessage="Cancel"
                  description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
                  id="global.cancel"
                />
              }
              size="default"
              theme="lightText"
              variant="text"
              onClick={() => setDialogOpen(false)}
            />
            <ButtonMain
              className="send-tipline-message__submit-button"
              disabled={isSending || submitDisabled}
              label={
                <FormattedMessage
                  defaultMessage="Send"
                  description="Label for button that commits action of sending a message to a tipline user"
                  id="sendTiplineMessage.send"
                />
              }
              size="default"
              theme="info"
              variant="contained"
              onClick={() => submitMessage(annotationId, text)}
            />
          </div>
        </Dialog> : null
      }
    </>
  );
};

SendTiplineMessage.propTypes = {
  annotationId: PropTypes.number.isRequired,
  channel: PropTypes.string.isRequired,
  username: PropTypes.string.isRequired,
};

export default SendTiplineMessage;
