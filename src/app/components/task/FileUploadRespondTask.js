import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import UploadFile from '../UploadFile';
import { FormattedGlobalMessage } from '../MappedMessage';
import Message from '../Message';

export default function FileUploadRespondTask({
  fieldset, onDismiss, onSubmit,
}) {
  // Store file + message as a single value: they always change as one.
  const [state, setState] = React.useState({ file: null, message: null });

  const handleChange = React.useCallback((file) => {
    setState({ file, message: null });
  });

  const handleError = React.useCallback((file, message) => {
    setState({ file: null, message });
  });

  const handleClickSubmit = React.useCallback(() => {
    const { file } = state;
    onSubmit(file.name, file);
    setState({ file: null, message: null });
  }, [state, onSubmit]);

  const handleClickCancel = React.useCallback(() => {
    setState({ file: null, message: null });
    onDismiss();
  }, [onDismiss]);

  return (
    <div>
      <Message message={state.message} />
      <UploadFile
        type="file"
        value={state.file}
        onChange={handleChange}
        onError={handleError}
      />
      <p className="task__resolver">
        <Button className="task__cancel" onClick={handleClickCancel}>
          <FormattedMessage id="fileUploadRespondTask.cancelTask" defaultMessage="Cancel" />
        </Button>
        <Button
          className="task__save"
          onClick={handleClickSubmit}
          disabled={!state.file}
          color="primary"
        >
          { fieldset === 'tasks' ?
            <FormattedMessage id="fileUploadRespondTask.answerTask" defaultMessage="Answer task" /> :
            <FormattedGlobalMessage messageKey="save" />
          }
        </Button>
      </p>
    </div>
  );
}
FileUploadRespondTask.defaultProps = {
  onDismiss: () => {},

};
FileUploadRespondTask.propTypes = {
  onDismiss: PropTypes.func, // onDismiss() => undefined
  onSubmit: PropTypes.func.isRequired, // onSubmit(fileName, file) => undefined
};
