import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import RuleOperatorWrapper from '../team/Rules/RuleOperatorWrapper';
import { brandHighlight } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    padding: theme.spacing(2),
    boxShadow: 'none',
  },
  ifGroup: {
    border: `2px solid ${brandHighlight}`,
  },
  paper2: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const CustomFilter = ({
  filterType,
  filterTypeOptions,
  onChangeFilterType,
  filterEntity,
  filterEntityLabel,
  filterEntityOptions,
  onChangeFilterEntity,
  filterEntityValue,
  filterEntityValueOptions,
  onChangeFilterEntityValue,
  onRemove,
}) => {
  const filterTypeLabel = <FormattedMessage id="CustomFilter.filterBy" defaultMessage="Filter by" />;
  const filterEntityValueSelectLabel = (
    <FormattedMessage
      id="CustomFilter.selectValueLabel"
      defaultMessage="Select value"
    />
  );
  const filterEntityValueTextFieldLabel = (
    <FormattedMessage
      id="CustomFilter.keywordsLabel"
      defaultMessage="Type a list of keywords separated by commas"
    />
  );

  const handleSelectFilterType = (selectedFilterType) => {
    onChangeFilterType(selectedFilterType);
  };

  const handleSelectFilterEntity = (selectedFilterEntity) => {
    onChangeFilterEntity(selectedFilterEntity);
  };

  const handleSelectFilterEntityValue = (selectedFilterEntityValue) => {
    onChangeFilterEntityValue(selectedFilterEntityValue);
  };

  const classes = useStyles();

  return (
    <RuleOperatorWrapper
      allowRemove
      center
      color={brandHighlight}
      onRemove={onRemove}
    >
      {[
        <Paper key="single-child" className={[classes.paper, classes.paper2, classes.ifGroup].join(' ')}>
          <Autocomplete
            className={classes.paper2}
            label={filterTypeLabel}
            value={filterTypeOptions.find(option => option.key === filterType)}
            onChange={(event, newValue) => {
              if (newValue) {
                handleSelectFilterType(newValue.key);
              }
            }}
            options={filterTypeOptions}
            getOptionLabel={option => option.value}
            renderInput={params => <TextField {...params} variant="outlined" label={filterTypeLabel} fullWidth />}
            fullWidth
          />
          { filterEntityOptions.length ? (
            <Autocomplete
              className={classes.paper2}
              label={filterEntityLabel}
              value={filterEntityOptions.find(option => option.key === filterEntity)}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleSelectFilterEntity(newValue.key);
                }
              }}
              options={filterEntityOptions}
              getOptionLabel={option => option.value}
              renderInput={params => <TextField {...params} variant="outlined" label={filterEntityLabel} fullWidth />}
              fullWidth
            />
          ) : null }
          { filterEntity && filterEntityValueOptions.length ? (
            <Autocomplete
              className={classes.paper2}
              label={filterEntityValueSelectLabel}
              value={filterEntityValueOptions.find(option => option.key === filterEntityValue)}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleSelectFilterEntityValue(newValue.key);
                }
              }}
              options={filterEntityValueOptions}
              getOptionLabel={option => option.value}
              renderInput={params => <TextField {...params} variant="outlined" label={filterEntityValueSelectLabel} fullWidth />}
              fullWidth
            />
          ) : null }
          { filterEntity && !filterEntityValueOptions.length ? (
            <TextField
              label={filterEntityValueTextFieldLabel}
              defaultValue={filterEntityValue}
              onBlur={(event) => {
                handleSelectFilterEntityValue(event.target.value);
              }}
              variant="outlined"
              fullWidth
            />
          ) : null }
        </Paper>,
      ]}
    </RuleOperatorWrapper>
  );
};

CustomFilter.defaultProps = {
  filterType: null,
  filterTypeOptions: null,
  filterEntity: null,
  filterEntityLabel: null,
  filterEntityOptions: null,
  filterEntityValue: null,
  filterEntityValueOptions: null,
};

CustomFilter.propTypes = {
  filterType: PropTypes.string,
  filterTypeOptions: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  onChangeFilterType: PropTypes.func.isRequired,
  filterEntity: PropTypes.number,
  filterEntityLabel: PropTypes.node,
  filterEntityOptions: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.number.isRequired,
    value: PropTypes.string.isRequired,
  })),
  onChangeFilterEntity: PropTypes.func.isRequired,
  filterEntityValue: PropTypes.string,
  filterEntityValueOptions: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
  })),
  onChangeFilterEntityValue: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default CustomFilter;
