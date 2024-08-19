/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal } from '@material-ui/core';
import TiplineHistory from './TiplineHistory';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import QuestionAnswerIcon from '../../icons/question_answer.svg';

const TiplineHistoryButton = ({
  channel,
  name,
  uid,
  // messageId,
}) => {
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const handleClick = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Tooltip
        arrow
        title={
          <FormattedMessage defaultMessage="Chat history with {user} on {channel}" description="Tooltip labeling a chat log with a user" id="tiplineHistory.tooltip" values={{ user: name, channel }} />
        }
      >
        <span>
          <ButtonMain className="int-tipline-history__button--open" iconCenter={<QuestionAnswerIcon />} theme="text" variant="outlined" onClick={handleClick} />
        </span>
      </Tooltip>
      <Modal
        open={dialogOpen}
        onClose={handleClose}
      >
        <TiplineHistory
          handleClose={handleClose}
          title={<FormattedMessage defaultMessage="Chat history with {user} on {channel}" description="Title field labeling a chat log with a user" id="tiplineHistory.title" values={{ user: name, channel }} />}
          uid={uid}
        />
      </Modal>
    </>
  );
};

TiplineHistoryButton.defaultProps = {
};

TiplineHistoryButton.propTypes = {
  uid: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  channel: PropTypes.string.isRequired, // WhatsApp, Telegram, etc.
  // messageId: PropTypes.string.isRequired,
};

export default TiplineHistoryButton;
