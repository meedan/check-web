import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import CopyToClipboard from 'react-copy-to-clipboard';

const MediaAnalysisField = ({ name, value, label }) => {
  const [copied, setCopied] = React.useState(false);

  const handleClick = () => {
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 500);
  };

  return (
    <Box my={2}>
      <TextField
        className={`media-analysis__${name}`}
        label={label}
        value={value}
        variant="outlined"
        rows={3}
        disabled
        multiline
        fullWidth
      />
      <Box display="flex" justifyContent="flex-end">
        { copied ?
          <Button disabled size="small">
            <FormattedMessage
              id="mediaAnalysisField.copied"
              defaultMessage="Copied!"
              description="Confirmation label that is displayed once a Copy link is clicked."
            />
          </Button> :
          <CopyToClipboard text={value}>
            <Button onClick={handleClick} size="small" color="primary">
              <FormattedMessage
                id="mediaAnalysisField.copy"
                defaultMessage="Copy text"
                description="Link text that once clicked copies text to clipboard."
              />
            </Button>
          </CopyToClipboard>
        }
      </Box>
    </Box>
  );
};

MediaAnalysisField.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.object.isRequired,
};

export default MediaAnalysisField;
