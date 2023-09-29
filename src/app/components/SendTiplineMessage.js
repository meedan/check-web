import React from 'react';
import Relay from 'react-relay/classic';
import { graphql, commitMutation } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import SendIcon from '../icons/send.svg';
import ButtonMain from './cds/buttons-checkboxes-chips/ButtonMain';
import LimitedTextArea from './layout/inputs/LimitedTextArea';

const SendTiplineMessage = ({ annotationId, channel, username }) => {
  const [text, setText] = React.useState();
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const submitMessage = (inReplyToId, message) => {
    // TODO write handlers
    const handleSuccess = () => {};
    const handleError = () => {};

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
      onCompleted: (response, error) => {
        if (error) {
          handleError();
        } else {
          handleSuccess(response);
        }
        // TODO close dialog
      },
      onError: handleError,
    });
  };

  return (
    <>
      <ButtonMain
        iconCenter={<SendIcon />}
        variant="outlined"
        size="default"
        theme="text"
        onClick={() => setDialogOpen(true)}
      />
      {/* TODO dialog close button */}
      <Dialog
        open={dialogOpen}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <FormattedMessage
            id="sendTiplineMessage.title"
            defaultMessage="Send message to {username} on {channel}"
            description="Title for messaging popup"
            values={{
              username,
              // TODO Add proper casing to channel names
              channel,
            }}
          />
        </DialogTitle>
        <DialogContent>
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
        </DialogContent>
        <DialogActions>
          {/* TODO add classnames or ids to buttons & interactive elements */}
          <ButtonMain
            variant="text"
            label={
              <FormattedMessage
                id="global.cancel"
                defaultMessage="Cancel"
                description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation"
              />
            }
          />
          {/* TODO disabled state during mutation flight */}
          <ButtonMain
            variant="contained"
            onClick={() => submitMessage(annotationId, text)}
            label={
              <FormattedMessage
                id="sendTiplineMessage.send"
                defaultMessage="Send"
                description="Label for button that commits action of sending a message to a tipline user"
              />
            }
          />
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SendTiplineMessage;
