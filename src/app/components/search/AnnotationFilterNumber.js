import React from 'react';
import { FormattedMessage } from 'react-intl';
import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';

const useStyles = makeStyles(theme => ({
  root: {
    width: theme.spacing(15),
  },
  inputMarginDense: {
    padding: '4px 8px',
  },
}));

const AnnotationFilterNumber = ({
  teamTask,
  query,
  onChange,
  onError,
}) => {
  const classes = useStyles();
  const [showErrorMsg, setShowErrorMsg] = React.useState(false);

  const getFieldValue = (field) => {
    const teamTaskValue = query.team_tasks.find(tt => tt.id.toString() === teamTask.node.dbid.toString());
    const { range } = teamTaskValue;
    const value = range ? range[field] : '';
    return value;
  };

  const handleFieldChange = (key, keyValue) => {
    const minNumber = getFieldValue('min');
    const maxNumber = getFieldValue('max');
    const range = { min: minNumber, max: maxNumber };
    if (key === 'min') {
      range.min = keyValue;
    } else if (key === 'max') {
      range.max = keyValue;
    }
    if (range.max !== '' && parseInt(range.min, 10) > parseInt(range.max, 10)) {
      setShowErrorMsg(true);
      onError((
        <FormattedMessage
          id="customFiltersManager.errorMessage"
          defaultMessage="First number should be less than second number"
          description="Message when user set range number with min value greater than max value"
        />
      ));
    } else {
      setShowErrorMsg(false);
      onError(null);
      onChange(['NUMERIC_RANGE'], { range });
    }
  };

  return (
    <Box display="flex" alignItems="center">
      <Box px={1}>
        <Typography component="span" variant="body2">
          <FormattedMessage id="numericRangeFilter.between" defaultMessage="between" />
        </Typography>
      </Box>
      <FormattedMessage id="customFiltersManager.enterNumber" defaultMessage="enter number">
        { placeholder => (
          <TextField
            classes={{ root: classes.root }}
            InputProps={{ classes: { inputMarginDense: classes.inputMarginDense } }}
            variant="outlined"
            size="small"
            placeholder={placeholder}
            value={getFieldValue('min')}
            onChange={(e) => { handleFieldChange('min', e.target.value); }}
            type="number"
            error={showErrorMsg}
          />
        )}
      </FormattedMessage>
      <Box px={1}>
        <Typography component="span" variant="body2">
          <FormattedMessage id="numericRangeFilter.and" defaultMessage="and" />
        </Typography>
      </Box>
      <FormattedMessage id="customFiltersManager.enterNumber" defaultMessage="enter number">
        { placeholder => (
          <TextField
            classes={{ root: classes.root }}
            InputProps={{ classes: { inputMarginDense: classes.inputMarginDense } }}
            variant="outlined"
            size="small"
            placeholder={placeholder}
            value={getFieldValue('max')}
            onChange={(e) => { handleFieldChange('max', e.target.value); }}
            type="number"
            error={showErrorMsg}
          />
        )}
      </FormattedMessage>
    </Box>
  );
};

export default AnnotationFilterNumber;
