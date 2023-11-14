import React from 'react';
import PropTypes from 'prop-types';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import Tooltip from './cds/alerts-and-prompts/Tooltip';
import { FlashMessageSetterContext } from './FlashMessage';
import GenericUnknownErrorMessage from './GenericUnknownErrorMessage';
import { getErrorMessageForRelayModernProblem } from '../helpers';
import IconClose from '../icons/clear.svg';
import SendIcon from '../icons/send.svg';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import LimitedTextArea from './layout/inputs/LimitedTextArea';
import styles from '../styles/css/dialog.module.css';
import inputStyles from '../styles/css/inputs.module.css';

const SendTiplineMessage = ({ annotationId, channel, username }) => {
  const [text, setText] = React.useState();
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isSending, setIsSending] = React.useState(false);
  const setFlashMessage = React.useContext(FlashMessageSetterContext);

  const submitMessage = (inReplyToId, message) => {
    setIsSending(true);

    const onSuccess = () => {
      setIsSending(false);
      setDialogOpen(false);
      setText('');
      setFlashMessage(
        <FormattedMessage
          id="sendTiplineMessage.success"
          defaultMessage="Message sent"
          description="Banner displayed when message is sent to tipline user successfully"
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

  return (
    <>
      <Tooltip
        arrow
        title={
          <FormattedMessage
            id="sendTiplineMessage.tooltip"
            defaultMessage="Send message to {username} on {channel}"
            description="Tooltip for messaging popup"
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
            variant="outlined"
            size="default"
            theme="text"
            onClick={() => setDialogOpen(true)}
          />
        </span>
      </Tooltip>
      { dialogOpen ?
        <Dialog
          className={styles['dialog-window']}
          open
          fullWidth
        >
          <div className={styles['dialog-title']}>
            <FormattedMessage
              tagName="h6"
              id="sendTiplineMessage.title"
              defaultMessage="Send message to {username} on {channel}"
              description="Title for messaging popup"
              values={{
                username,
                channel,
              }}
            />
            <ButtonMain
              className={styles['dialog-close-button']}
              variant="text"
              size="small"
              theme="text"
              iconCenter={<IconClose />}
              onClick={() => setDialogOpen(false)}
            />
          </div>
          <div className={styles['dialog-content']}>
            <div className={inputStyles['form-fieldset']}>
              <div className={inputStyles['form-fieldset-field']}>
                <LimitedTextArea
                  value={text}
                  label={
                    <FormattedMessage
                      id="sendTiplineMessage.inputLabel"
                      defaultMessage="Message"
                      description="Message input label"
                    />
                  }
                  maxChars={800}
                  setValue={m => setText(m)}
                />
              </div>
            </div>
          </div>
          <div className={styles['dialog-actions']}>
            <ButtonMain
              className="send-tipline-message__cancel-button"
              size="default"
              variant="text"
              theme="lightText"
              onClick={() => setDialogOpen(false)}
              label={
                <FormattedMessage
                  id="global.cancel"
                  defaultMessage="Cancel"
                  description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
                />
              }
            />
            <ButtonMain
              className="send-tipline-message__submit-button"
              disabled={isSending}
              size="default"
              variant="contained"
              theme="brand"
              onClick={() => submitMessage(annotationId, text)}
              label={
                <FormattedMessage
                  id="sendTiplineMessage.send"
                  defaultMessage="Send"
                  description="Label for button that commits action of sending a message to a tipline user"
                />
              }
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
