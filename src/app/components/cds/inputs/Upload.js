import React from 'react';
import PropTypes from 'prop-types';
import {
  HighlightOff as CancelIcon,
  CheckCircleOutline,
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import { FormattedMessage } from 'react-intl';
import styles from './Upload.module.css';

function Upload({
  fileName,
  setFile,
  setFileName,
  handleFileChange,
}) {
  const [dropping, setDropping] = React.useState(false);
  const [enterTarget, setEnterTarget] = React.useState(null);

  const handleClick = (e) => {
    // We use :scope to scope the query to just children of the parent element, in case there is more than one Upload component on the page
    const inputElement = e.target.parentElement.querySelector(':scope .upload-input');
    if (inputElement) {
      inputElement.click();
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer?.items?.length > 1) {
      // setError({ message: messages.errorTooManyFiles });
    } else if (e.dataTransfer?.items[0]?.kind === 'file') {
      const fileData = e.dataTransfer?.items[0]?.getAsFile();
      setFile(fileData);
    } else {
      // setError({ message: messages.errorInvalidFile });
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
        <span className="typography-button">
          <FormattedMessage id="upload.dragMessage" defaultMessage="Drag a video, image, PDF, or audio file here or" description="A label that appears when a user drags a file over a valid file drop area" />
        </span>
        &nbsp;<a className="typography-button" href="#!" onClick={handleClick}>Select a local file</a>.
      </div>
    );
  };

  const RenderFile = () => (
    <div className={`typography-button ${styles['file-name']} ${styles['file-name-grid']}`}>
      <div><CheckCircleOutline className={styles['icon-label']} />&nbsp;{fileName}</div>
      <IconButton
        onClick={handleRemove}
        className={styles['file-name']}
      >
        <CancelIcon />
      </IconButton>
    </div>
  );

  return (
    // eslint-disable-next-line
    <div
      className={`${styles.container} ${(dropping && !fileName) && styles.dropping} ${fileName && styles['file-name-container']}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
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
