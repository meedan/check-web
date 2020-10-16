import React from 'react';
import { FormattedMessage, defineMessages, injectIntl } from 'react-intl';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import CustomFilter from './CustomFilter';

const messages = defineMessages({
  metadataChoiceLabel: {
    id: 'AddCustomFilters.metadataChoiceLabel',
    defaultMessage: 'Metadata has specific value',
  },
  metadataTextLabel: {
    id: 'AddCustomFilters.metadataTextLabel',
    defaultMessage: 'Metadata contains keyword',
  },
  taskChoiceLabel: {
    id: 'AddCustomFilters.taskChoiceLabel',
    defaultMessage: 'Task has specific answer',
  },
  taskTextLabel: {
    id: 'AddCustomFilters.taskTextLabel',
    defaultMessage: 'Task answer contains keyword',
  },
});

const AddCustomFilters = ({
  intl,
  team: { team_tasks },
  onFilterChange,
}) => {
  const [filterType, setFilterType] = React.useState(null);
  const [filterEntity, setFilterEntity] = React.useState(null);

  const handleChangeFilterType = (value) => {
    setFilterType(value);
  };
  const handleChangeFilterEntity = (value) => {
    setFilterEntity(value);
    // console.log('value', value);
  };

  const handleChangeFilterEntityValue = (fev) => {
    // console.log('value', fev);

    const filterParams = {
      responses: fev.target ? fev.target.value : fev,
      responses_type: (
        filterType === 'metadata_choice' ||
        filterType === 'tasks_choice' ?
          'choice' : 'free_text'
      ),
      team_tasks: [`${filterEntity}`],
    };
    onFilterChange(filterParams);
  };

  // const filterSettings = {
  //   metadata_choice: {
  //     label: 'Metadata has specific value',
  //     condition: (t => t.node.fieldset === 'metadata' &&
  //       (t.node.type === 'single_choice' || t.node.type === 'multiple_choice')),
  //   },
  //   metadata_text: {
  //     label: 'Metadata contains keyword',
  //     condition: (t => t.node.fieldset === 'metadata' && t.node.type === 'free_text'),
  //   },
  //   task_choice: {
  //     label: 'Task has specific answer',
  //     condition: (t => t.node.fieldset === 'tasks' &&
  //       (t.node.type === 'single_choice' || t.node.type === 'multiple_choice')),
  //   },
  //   task_text: {
  //     label: 'Task answer contains keyword',
  //     condition: (t => t.node.fieldset === 'tasks' && t.node.type === 'free_text'),
  //   },
  // };

  const buildFilterTypeOptions = () => {
    const options = [];
    if (team_tasks.edges.some(t => t.node.fieldset === 'metadata' &&
    (t.node.type === 'single_choice' || t.node.type === 'multiple_choice'))) {
      options.push({
        key: 'metadata_choice',
        value: intl.formatMessage(messages.metadataChoiceLabel),
      });
    }

    if (team_tasks.edges.some(t => t.node.fieldset === 'metadata' && t.node.type === 'free_text')) {
      options.push({
        key: 'metadata_text',
        value: intl.formatMessage(messages.metadataTextLabel),
      });
    }

    if (team_tasks.edges.some(t => t.node.fieldset === 'tasks' &&
    (t.node.type === 'single_choice' || t.node.type === 'multiple_choice'))) {
      options.push({
        key: 'task_choice',
        value: intl.formatMessage(messages.taskChoiceLabel),
      });
    }

    if (team_tasks.edges.some(t => t.node.fieldset === 'tasks' && t.node.type === 'free_text')) {
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
        team_tasks.edges.filter(t => t.node.fieldset === 'metadata' &&
        (t.node.type === 'single_choice' || t.node.type === 'multiple_choice'))
          .map(t => ({ key: t.node.dbid, value: t.node.label }))
      ));
    }
    if (filterType === 'metadata_text') {
      options.push(...(
        team_tasks.edges.filter(t => t.node.fieldset === 'metadata' && t.node.type === 'free_text')
          .map(t => ({ key: t.node.dbid, value: t.node.label }))
      ));
    }
    if (filterType === 'task_choice') {
      options.push(...(
        team_tasks.edges.filter(t => t.node.fieldset === 'tasks' &&
        (t.node.type === 'single_choice' || t.node.type === 'multiple_choice'))
          .map(t => ({ key: t.node.dbid, value: t.node.label }))
      ));
    }
    if (filterType === 'task_text') {
      options.push(...(
        team_tasks.edges.filter(t => t.node.fieldset === 'tasks' && t.node.type === 'free_text')
          .map(t => ({ key: t.node.dbid, value: t.node.label }))
      ));
    }
    return options;
  };

  const buildFilterEntityValueOptions = () => {
    const options = [];
    const entity = team_tasks.edges.find(t => t.node.dbid === filterEntity);
    // console.log('entity', entity);
    if (entity) {
      options.push(...entity.node.options.map(o => ({ key: o.label, value: o.label })));
    }
    return options;
  };

  const filterTypeOptions = buildFilterTypeOptions();
  const filterEntityOptions = buildFilterEntityOptions();
  const filterEntityValueOptions = buildFilterEntityValueOptions();
  const filterEntityLabel = filterType === 'task_text' || filterType === 'task_choice' ? (
    <FormattedMessage id="AddCustomFilters.entityTaskLabel" defaultMessage="Select task" />
  ) : (
    <FormattedMessage id="AddCustomFilters.entityMetadataLabel" defaultMessage="Select metadata" />
  );

  // console.log('team', team);

  return (
    <CustomFilter
      filterType={filterType}
      filterEntity={filterEntity}
      filterEntityLabel={filterEntityLabel}
      filterTypeOptions={filterTypeOptions}
      filterEntityOptions={filterEntityOptions}
      filterEntityValueOptions={filterEntityValueOptions}
      onChangeFilterType={handleChangeFilterType}
      onChangeFilterEntity={handleChangeFilterEntity}
      onChangeFilterEntityValue={handleChangeFilterEntityValue}
    />
  );
};

export default createFragmentContainer(injectIntl(AddCustomFilters), graphql`
  fragment AddCustomFilters_team on Team {
    team_tasks(first: 10000) {
      edges {
        node {
          id
          dbid
          fieldset
          label
          options
          type
        }
      }
    }
  }
`);
