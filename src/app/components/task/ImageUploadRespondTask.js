import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import UploadImage from '../UploadImage';
import Message from '../Message';

export default function ImageUploadRespondTask({
  onDismiss, onSubmit,
}) {
  // Store image+message as a single value: they always change as one.
  const [state, setState] = React.useState({ image: null, message: null });

  const handleChange = React.useCallback((file) => {
    setState({ image: file, message: null });
  });

  const handleError = React.useCallback((file, message) => {
    setState({ image: null, message });
  });

  const handleClickSubmit = React.useCallback(() => {
    const { image } = state;
    onSubmit(image.name, image);
    setState({ image: null, message: null });
  }, [state, onSubmit]);

  const handleClickCancel = React.useCallback(() => {
    setState({ image: null, message: null });
    onDismiss();
  }, [onDismiss]);

  return (
    <div>
      <Message message={state.message} />
      <UploadImage
        type="image"
        value={state.image}
        onChange={handleChange}
        onError={handleError}
      />
      <p className="task__resolver">
        <Button className="task__cancel" onClick={handleClickCancel}>
          <FormattedMessage id="imageUploadRespondTask.cancelTask" defaultMessage="Cancel" />
        </Button>
        <Button
          className="task__save"
          onClick={handleClickSubmit}
          disabled={!state.image}
          color="primary"
        >
          <FormattedMessage id="imageUploadRespondTask.answerTask" defaultMessage="Answer task" />
        </Button>
      </p>
    </div>
  );
}
ImageUploadRespondTask.defaultProps = {
  onDismiss: () => {},

};
ImageUploadRespondTask.propTypes = {
  onDismiss: PropTypes.func, // onDismiss() => undefined
  onSubmit: PropTypes.func.isRequired, // onSubmit(fileName, file) => undefined
};
