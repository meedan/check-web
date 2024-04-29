import React from 'react';
import PropTypes from 'prop-types';
import { Typography, Grid } from '@material-ui/core';
import TextField from './TextField';

function MetadataText({
  node,
  classes,
  EditButton,
  DeleteButton,
  CancelButton,
  SaveButton,
  AnnotatorInformation,
  FieldInformation,
  hasData,
  isEditing,
  metadataValue,
  setMetadataValue,
  disabled,
  required,
}) {
  const mutationPayload = {
    annotation_type: 'task_response_free_text',
    set_fields: `{"response_free_text":"${metadataValue}"}`,
  };

  function handleChange(e) {
    setMetadataValue(e.target.value);
  }

  function cleanup() {
    setMetadataValue('');
  }

  function linkify(plainText) {
    // regexes modified from https://stackoverflow.com/a/3809435/4869657, adding word boundaries and greedy operator
    // this regex replacement uses capture groups. $1 is the entire captured url within the word boundary. $2 is the captured protocol, and $4 is the post-protocol portion of the url. By using the `//` "protocol-relative url" scheme, we end up redirecting cases of `example.com` to `https://example.com` since Check is served on an https url.
    const parsedText = plainText.replace(/\b((http:|https:)?(\/\/)?((www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)))\b/g, '<a href="$2//$4" target="_blank">$1</a>');
    return <span dangerouslySetInnerHTML={{ __html: parsedText }} />; // eslint-disable-line react/no-danger
  }

  return (
    <>
      <FieldInformation />
      {hasData && !isEditing ? (
        <>
          <Typography variant="body1" className={classes.value}>
            {linkify(node.first_response_value)}
          </Typography>
          <Grid container alignItems="flex-end" wrap="nowrap" spacing={0}>
            <Grid item>
              <EditButton />
            </Grid>
            <Grid item>
              <DeleteButton onClick={cleanup} />
            </Grid>
            <Grid item xs>
              <AnnotatorInformation />
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <TextField
            id="metadata-input"
            multiline
            rowsMax={Infinity}
            label="Answer here"
            value={metadataValue}
            onChange={handleChange}
            disabled={disabled}
          />
          <Grid container alignItems="flex-end" wrap="nowrap" spacing={0}>
            <Grid item>
              <CancelButton />
            </Grid>
            <Grid item>
              <SaveButton
                {...{ mutationPayload, required }}
                empty={metadataValue === ''}
              />
            </Grid>
            { disabled ? null : <Grid item>asdfasdf</Grid> }
          </Grid>
        </>
      )}
    </>
  );
}

MetadataText.defaultProps = {
  disabled: false,
};

MetadataText.propTypes = {
  node: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  disabled: PropTypes.bool,
  EditButton: PropTypes.element.isRequired,
  DeleteButton: PropTypes.element.isRequired,
  CancelButton: PropTypes.element.isRequired,
  SaveButton: PropTypes.element.isRequired,
  AnnotatorInformation: PropTypes.element.isRequired,
  FieldInformation: PropTypes.element.isRequired,
  hasData: PropTypes.bool.isRequired,
  isEditing: PropTypes.bool.isRequired,
  metadataValue: PropTypes.string.isRequired,
  setMetadataValue: PropTypes.func.isRequired,
};

export default MetadataText;
