import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Modal } from '@material-ui/core';
import TiplineHistory from './TiplineHistory';
import ButtonMain from '../cds/buttons-checkboxes-chips/ButtonMain';
import QuestionAnswerIcon from '../../icons/question_answer.svg';

const TiplineHistoryButton = ({
  uid,
  name,
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
      <ButtonMain variant="outlined" theme="text" iconCenter={<QuestionAnswerIcon />} onClick={handleClick} className="int-tipline-history__button--open" />
      <Modal
        open={dialogOpen}
        onClose={handleClose}
      >
        <TiplineHistory
          uid={uid}
          handleClose={handleClose}
          title={<FormattedMessage id="tiplineHistory.title" description="Title field labeling a chat log with a user" defaultMessage="Chat with {user}" values={{ user: name }} />}
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
  // messageId: PropTypes.string.isRequired,
};

export default TiplineHistoryButton;
