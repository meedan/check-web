import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage, defineMessages, injectIntl, intlShape } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Popover from '@material-ui/core/Popover';
import { makeStyles } from '@material-ui/core/styles';
import StarIcon from '@material-ui/icons/Star';
import CustomFilter from './CustomFilter';

const messages = defineMessages({
  metadataChoiceLabel: {
    id: 'CustomTeamTaskFilter.metadataChoiceLabel',
    defaultMessage: 'Metadata has specific value',
  },
  metadataTextLabel: {
    id: 'CustomTeamTaskFilter.metadataTextLabel',
    defaultMessage: 'Metadata contains keyword',
  },
  taskChoiceLabel: {
    id: 'CustomTeamTaskFilter.taskChoiceLabel',
    defaultMessage: 'Task has specific answer',
  },
  taskTextLabel: {
    id: 'CustomTeamTaskFilter.taskTextLabel',
    defaultMessage: 'Task answer contains keyword',
  },
  noValue: {
    id: 'CustomTeamTaskFilter.noValue',
    defaultMessage: 'No value is set',
  },
  anyValue: {
    id: 'CustomTeamTaskFilter.anyValue',
    defaultMessage: 'Any value is set',
  },
});

const useStyles = makeStyles({
  root: {
    zIndex: 1000,
  },
  paper: {
    maxWidth: '360px',
  },
});

const useStylesButton = makeStyles({
  root: {
    '&:hover': {
      backgroundColor: '#ddd',
    },
  },
  text: {
    backgroundColor: '#ddd',
  },
  label: {
    textTransform: 'none',
    fontWeight: 'normal',
  },
});

const isMetadataChoice = t =>
  t.node.fieldset === 'metadata' &&
  (t.node.type === 'single_choice' || t.node.type === 'multiple_choice');

const isMetadataText = t =>
  t.node.fieldset === 'metadata' &&
  t.node.type === 'free_text';

const isTaskChoice = t =>
  t.node.fieldset === 'tasks' &&
  (t.node.type === 'single_choice' || t.node.type === 'multiple_choice');

const isTaskText = t =>
  t.node.fieldset === 'tasks' &&
  t.node.type === 'free_text';

const CustomTeamTaskFilter = ({
  filter,
  index,
  intl,
  team: { team_tasks },
  onRemove,
  onFilterChange,
}) => {
  const getTypeFromFilter = (f) => {
    let type = null;
    if (f) {
      const task = team_tasks.edges.find(t => String(t.node.dbid) === f.id);
      if (task && isMetadataChoice(task)) type = 'metadata_choice';
      if (task && isMetadataText(task)) type = 'metadata_text';
      if (task && isTaskChoice(task)) type = 'task_choice';
      if (task && isTaskText(task)) type = 'task_text';
    }
    return type;
  };

  const getEntityFromFilter = f => f ? Number(f.id) : null;
  const getEntityValueFromFilter = f => f ? f.response : null;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [filterType, setFilterType] = React.useState(getTypeFromFilter(filter));

  const [filterEntity, setFilterEntity] = React.useState(getEntityFromFilter(filter));
  const filterEntityValue = getEntityValueFromFilter(filter);

  const classes = useStyles();
  const classesButton = useStylesButton();

  const handleChangeFilterType = (value) => {
    setFilterType(value);
  };
  const handleChangeFilterEntity = (value) => {
    setFilterEntity(value);
  };

  const handleChangeFilterEntityValue = (value) => {
    const filterParams = {
      id: `${filterEntity}`,
      response_type: (
        filterType === 'metadata_text' ||
        filterType === 'task_text' ?
          'free_text' : 'choice'
      ),
      response: value,
    };
    onFilterChange(filterParams, index);
  };

  const handleRemove = () => {
    onRemove(index);
  };

  const buildFilterTypeOptions = () => {
    const options = [];
    if (team_tasks.edges.some(t => isMetadataChoice(t))) {
      options.push({
        key: 'metadata_choice',
        value: intl.formatMessage(messages.metadataChoiceLabel),
      });
    }

    if (team_tasks.edges.some(t => isMetadataText(t))) {
      options.push({
        key: 'metadata_text',
        value: intl.formatMessage(messages.metadataTextLabel),
      });
    }

    if (team_tasks.edges.some(t => isTaskChoice(t))) {
      options.push({
        key: 'task_choice',
        value: intl.formatMessage(messages.taskChoiceLabel),
      });
    }

    if (team_tasks.edges.some(t => isTaskText(t))) {
      options.push({
        key: 'task_text',
        value: intl.formatMessage(messages.taskTextLabel),
      });
    }

    return options;
  };

  const buildFilterEntityOptions = () => {
    const options = [];
    if (filterType === 'metadata_choice') {
      options.push(...(
        team_tasks.edges.filter(t => isMetadataChoice(t))
          .filter(t => t.node.associated_type === 'ProjectMedia')
          .map(t => ({ key: t.node.dbid, value: t.node.label }))
      ));
    }
    if (filterType === 'metadata_text') {
      options.push(...(
        team_tasks.edges.filter(t => isMetadataText(t))
          .filter(t => t.node.associated_type === 'ProjectMedia')
          .map(t => ({ key: t.node.dbid, value: t.node.label }))
      ));
    }
    if (filterType === 'task_choice') {
      options.push(...(
        team_tasks.edges.filter(t => isTaskChoice(t))
          .filter(t => t.node.associated_type === 'ProjectMedia')
          .map(t => ({ key: t.node.dbid, value: t.node.label }))
      ));
    }
    if (filterType === 'task_text') {
      options.push(...(
        team_tasks.edges.filter(t => isTaskText(t))
          .filter(t => t.node.associated_type === 'ProjectMedia')
          .map(t => ({ key: t.node.dbid, value: t.node.label }))
      ));
    }
    return options;
  };

  const buildFilterEntityValueOptions = () => {
    const options = [{
      key: 'NO_VALUE',
      value: intl.formatMessage(messages.noValue),
    },
    {
      key: 'ANY_VALUE',
      value: intl.formatMessage(messages.anyValue),
    }];
    const entity = team_tasks.edges.find(t => t.node.dbid === filterEntity);
    if (entity) {
      options.push(...entity.node.options
        .filter(fo => !fo.other)
        .map(o => ({ key: o.label, value: o.label })));
    }
    return options;
  };

  const filterTypeOptions = buildFilterTypeOptions();
  const filterEntityOptions = buildFilterEntityOptions();
  const filterEntityValueOptions = buildFilterEntityValueOptions();
  const filterEntityLabel = filterType === 'task_text' || filterType === 'task_choice' ? (
    <FormattedMessage id="CustomTeamTaskFilter.entityTaskLabel" defaultMessage="Select task" />
  ) : (
    <FormattedMessage id="CustomTeamTaskFilter.entityMetadataLabel" defaultMessage="Select metadata" />
  );

  const FilterLabel = () => {
    if (!filterEntityValue || !filter) {
      return (
        <FormattedMessage
          id="customFiltersManager.label"
          defaultMessage="Custom fields"
        />
      );
    }

    const task = team_tasks.edges.find(t => String(t.node.dbid) === filter.id);

    if (filterEntityValue === 'NO_VALUE') {
      return (
        <FormattedMessage
          id="CustomTeamTaskFilter.textNoValue"
          defaultMessage='"{entity}" contains no value'
          values={{ entity: task.node.label }}
        />
      );
    }

    if (filterEntityValue === 'ANY_VALUE') {
      return (
        <FormattedMessage
          id="CustomTeamTaskFilter.textAnyValue"
          defaultMessage='"{entity}" contains any value'
          values={{ entity: task.node.label, value: filterEntityValue }}
        />
      );
    }

    if (filterType === 'task_choice' || filterType === 'metadata_choice') {
      return (
        <FormattedMessage
          id="CustomTeamTaskFilter.choiceFilter"
          defaultMessage='"{entity}" has value {value}'
          values={{ entity: task.node.label, value: filterEntityValue }}
        />
      );
    }

    if (filterType === 'task_text' || filterType === 'metadata_text') {
      return (
        <FormattedMessage
          id="CustomTeamTaskFilter.textFilter"
          defaultMessage='"{entity}" contains {value}'
          values={{ entity: task.node.label, value: filterEntityValue }}
        />
      );
    }

    return null;
  };

  return (
    <React.Fragment>
      <Box maxWidth="400px" mr={1} mb={1}>
        <Button
          classes={classesButton}
          disableRipple
          onClick={e => setAnchorEl(e.currentTarget)}
          startIcon={<StarIcon />}
        >
          <FilterLabel />
        </Button>
      </Box>
      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        classes={classes}
        onClose={() => setAnchorEl(null)}
        open={Boolean(anchorEl)}
      >
        <Box width={360} p={2}>
          <CustomFilter
            filterType={filterType}
            filterEntity={filterEntity}
            filterEntityValue={filterEntityValue}
            filterEntityLabel={filterEntityLabel}
            filterTypeOptions={filterTypeOptions}
            filterEntityOptions={filterEntityOptions}
            filterEntityValueOptions={filterEntityValueOptions}
            onRemove={handleRemove}
            onChangeFilterType={handleChangeFilterType}
            onChangeFilterEntity={handleChangeFilterEntity}
            onChangeFilterEntityValue={handleChangeFilterEntityValue}
          />
        </Box>
      </Popover>
    </React.Fragment>
  );
};

CustomTeamTaskFilter.propTypes = {
  filter: PropTypes.shape({
    id: PropTypes.string,
    response: PropTypes.string,
    response_type: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
  intl: intlShape.isRequired,
  team: PropTypes.shape({
    team_tasks: PropTypes.shape({
      edges: PropTypes.arrayOf(PropTypes.shape({
        node: PropTypes.shape({
          id: PropTypes.string.isRequired,
          dbid: PropTypes.number.isRequired,
          fieldset: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired,
          options: PropTypes.array.isRequired,
          type: PropTypes.string.isRequired,
        }),
      })),
    }),
  }).isRequired,
  onRemove: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
};

export default createFragmentContainer(injectIntl(CustomTeamTaskFilter), graphql`
  fragment CustomTeamTaskFilter_team on Team {
    team_tasks(first: 10000) {
      edges {
        node {
          id
          dbid
          fieldset
          label
          options
          type
          associated_type
        }
      }
    }
  }
`);
