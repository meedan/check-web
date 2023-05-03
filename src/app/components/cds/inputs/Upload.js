import React from 'react';
import PropTypes from 'prop-types';

function Upload({
  handleFileChange,
  headerFileUrl,
}) {
  const fileNameFromUrl = new RegExp(/[^/\\&?]+\.\w{3,4}(?=([?&].*$|$))/);
  const fileName = headerFileUrl.match(fileNameFromUrl) && headerFileUrl.match(fileNameFromUrl)[0];

  return (
    <>
      <form>
        <input type="file" onChange={handleFileChange} />
      </form>
      <p>{fileName}</p>
    </>
  );
}

Upload.defaultProps = {
  headerFileUrl: '',
};

Upload.propTypes = {
  handleFileChange: PropTypes.func.isRequired,
  headerFileUrl: PropTypes.string,
};

export default Upload;
