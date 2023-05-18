import React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import { FormattedMessage } from 'react-intl';
import ErrorOutlineIcon from '../../../icons/error_outline.svg';
import CheckCircleIcon from '../../../icons/check_circle.svg';
import CancelIcon from '../../../icons/cancel.svg';
import styles from './Upload.module.css';

function Upload({
  fileName,
  handleFileChange,
  setFile,
  setFileName,
}) {
  const [dropping, setDropping] = React.useState(false);
  // This is a state that keeps track of what element we are currently hovering the mouse over, which allows us to prevent weird render states around onDragLeave for elements that are contained within different elements
  const [enterTarget, setEnterTarget] = React.useState(null);
  // This state variable is for errors internal to the logic of this component, which will appear as a banner in the component itself.
  const [errorInternal, setErrorInternal] = React.useState(null);

  const errorTooManyFiles = (<FormattedMessage
    id="metadata.file.tooManyFiles"
    defaultMessage="You can only upload one file here. Please try uploading one file."
    description="This message appears when a user tries to add two or more files at once to the file upload widget."
  />);

  const errorInvalidFile = (<FormattedMessage
    id="metadata.file.invalidFile"
    defaultMessage="This is not a valid file. Please try again with a different file."
    description="This message appears when a user tries to add a file that the browser cannot read for some reason to the file upload widget."
  />);

  const handleClick = (e) => {
    // We use :scope to scope the query to just children of the parent element, in case there is more than one Upload component on the page
    const inputElement = e.target.parentElement.querySelector(':scope .upload-input');
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.items[0]?.kind !== 'file') {
      setErrorInternal(errorInvalidFile);
    } else if (e.dataTransfer?.items?.length > 1) {
      setErrorInternal(errorTooManyFiles);
    } else {
      const fileData = e.dataTransfer?.items[0]?.getAsFile();
      setFile(fileData);
    }
    setDropping(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    setEnterTarget(e.target);
    setDropping(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (e.target === enterTarget) {
      setDropping(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setFileName('');
  };

  const RenderDropZone = () => {
    if (dropping) {
      return (
        <div className={`typography-button ${styles['drop-text']} ${styles.red}`}>
          <FormattedMessage id="upload.dropFile" defaultMessage="Drop file here" description="A label that appears when a user drags a file over a valid file drop area" />
        </div>
      );
    }
    return (
      <div>
        <form>
          <input className={`upload-input ${styles.input}`} type="file" onChange={handleFileChange} />
        </form>
        <span className={`typography-button ${styles['drag-text']}`}>
          <FormattedMessage id="upload.dragMessage" defaultMessage="Drag a video, image, PDF, or audio file here or" description="A label that appears when a user drags a file over a valid file drop area" />
        </span>
        &nbsp;<a className="typography-button" href="#!" onClick={handleClick}>Select a local file</a>.
      </div>
    );
  };

  const RenderFile = () => (
    <div className={`typography-button ${styles['file-name']} ${styles['file-name-grid']}`}>
      <div><CheckCircleIcon className={styles['icon-label']} />&nbsp;{fileName}</div>
      <IconButton
        onClick={handleRemove}
        className={styles['delete-button']}
      >
        <CancelIcon />
      </IconButton>
    </div>
  );

  const RenderError = () => (
    <div className={`${styles.error}`}>
      <div><ErrorOutlineIcon className={styles['error-icon']} />&nbsp;{fileName}</div>
      <div className="typography-caption">{ errorInternal }</div>
    </div>
  );

  return (
    <div
      className={`${styles.container} ${(dropping && !fileName) && styles.dropping} ${fileName && styles['file-name-container']} ${errorInternal && styles['container-error']}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      { errorInternal && <RenderError /> }
      { fileName ? <RenderFile /> : <RenderDropZone /> }
    </div>
  );
}

Upload.defaultProps = {
  fileName: '',
};

Upload.propTypes = {
  handleFileChange: PropTypes.func.isRequired,
  fileName: PropTypes.string,
};

export default Upload;
