import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal } from '@material-ui/core';
import TiplineHistory from './TiplineHistory';
import Tooltip from '../cds/alerts-and-prompts/Tooltip';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import QuestionAnswerIcon from '../../icons/question_answer.svg';

const TiplineHistoryButton = ({
  uid,
  name,
  channel,
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
          <FormattedMessage id="tiplineHistory.tooltip" description="Tooltip labeling a chat log with a user" defaultMessage="Chat history with {user} on {channel}" values={{ user: name, channel }} />
        }
      >
        <span>
          <ButtonMain variant="outlined" theme="text" iconCenter={<QuestionAnswerIcon />} onClick={handleClick} className="int-tipline-history__button--open" />
        </span>
      </Tooltip>
      <Modal
        open={dialogOpen}
        onClose={handleClose}
      >
        <TiplineHistory
          uid={uid}
          handleClose={handleClose}
          title={<FormattedMessage id="tiplineHistory.title" description="Title field labeling a chat log with a user" defaultMessage="Chat history with {user} on {channel}" values={{ user: name, channel }} />}
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
