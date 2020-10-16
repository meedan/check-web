import React from 'react';
import { FormattedMessage } from 'react-intl';
import Autocomplete from '@material-ui/lab/Autocomplete';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';
import { makeStyles } from '@material-ui/core/styles';
import RuleOperatorWrapper from '../team/Rules/RuleOperatorWrapper';
import { inProgressYellow } from '../../styles/js/shared';

const useStyles = makeStyles(theme => ({
  paper: {
    width: '100%',
    padding: theme.spacing(2),
    boxShadow: 'none',
  },
  ifGroup: {
    border: `2px solid ${inProgressYellow}`,
  },
  paper2: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
}));

const CustomFilter = ({
  filterType,
  filterEntity,
  // filterEntityValue,
  filterTypeOptions,
  filterEntityOptions,
  // filterEntityValueOptions,
  onChangeFilterType,
  onChangeFilterEntity,
  // onChangeFilterEntityValue,
}) => {
  const label = <FormattedMessage id="CustomFilter.filterBy" defaultMessage="Filter by" />;
  const handleSelectFilterType = (selectedFilterType) => {
    console.log('filterType', filterType);
    console.log('filterType', selectedFilterType);
    onChangeFilterType(selectedFilterType);
  };

  const handleSelectFilterEntity = (selectedFilterEntity) => {
    console.log('filterEntity', filterEntity);
    console.log('filterEntity', selectedFilterEntity);
    onChangeFilterEntity(selectedFilterEntity);
  };

  const classes = useStyles();

  return (
    <RuleOperatorWrapper center color={inProgressYellow}>
      {[
        <Paper className={[classes.paper, classes.paper2, classes.ifGroup].join(' ')}>
          <Autocomplete
            className={classes.paper2}
            label={label}
            value={filterTypeOptions.find(option => option.key === filterType)}
            onChange={(event, newValue) => {
              if (newValue) {
                handleSelectFilterType(newValue.key);
              }
            }}
            options={filterTypeOptions.sort((a, b) => (a.value.localeCompare(b.value)))}
            getOptionLabel={option => option.value}
            renderInput={params => <TextField {...params} variant="outlined" label={label} fullWidth />}
            fullWidth
          />
          { filterEntityOptions.length ? (
            <Autocomplete
              className={classes.paper2}
              label={label}
              value={filterEntityOptions.find(option => option.key === filterEntity)}
              onChange={(event, newValue) => {
                if (newValue) {
                  handleSelectFilterEntity(newValue.key);
                }
              }}
              options={filterEntityOptions.sort((a, b) => (a.value.localeCompare(b.value)))}
              getOptionLabel={option => option.value}
              renderInput={params => <TextField {...params} variant="outlined" label={label} fullWidth />}
              fullWidth
            />
          ) : null }
        </Paper>,
      ]}
    </RuleOperatorWrapper>
  );
};

export default CustomFilter;
