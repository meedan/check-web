import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import CustomFilter from './CustomFilter';

const AddCustomFilters = ({ team, team: { metadata, tasks } }) => {
  const [filterType, setFilterType] = React.useState(null);
  const [filterEntity, setFilterEntity] = React.useState(null);

  const filterTypeOptions = [];
  const filterEntityOptions = [];

  const handleChangeFilterType = (value) => {
    setFilterType(value);
  };
  const handleChangeFilterEntity = (value) => {
    setFilterEntity(value);
    console.log('value', value);
  };

  if (metadata.edges.some(m => m.node.type === 'free_text')) {
    filterTypeOptions.push({ key: 'metadata_text', value: 'Metadata contains keyword' });
    if (filterType === 'metadata_text') {
      filterEntityOptions.push(...(
        metadata.edges.filter(m => m.node.type === 'free_text')
          .map(m => ({ key: m.node.dbid, value: m.node.label }))
      ));
    }
  }

  if (metadata.edges.some(m => m.node.type === 'single_choice' || m.node.type === 'multiple_choice')) {
    filterTypeOptions.push({ key: 'metadata_choice', value: 'Metadata has specific value' });
    if (filterType === 'metadata_choice') {
      filterEntityOptions.push(...(
        metadata.edges.filter(m => m.node.type === 'single_choice' || m.node.type === 'multiple_choice')
          .map(m => ({ key: m.node.dbid, value: m.node.label }))
      ));
    }
  }

  if (tasks.edges.some(t => t.node.type === 'free_text')) {
    filterTypeOptions.push({ key: 'task_text', value: 'Task answer contains keyword' });
    if (filterType === 'task_text') {
      filterEntityOptions.push(...(
        tasks.edges.filter(m => m.node.type === 'free_text')
          .map(m => ({ key: m.node.dbid, value: m.node.label }))
      ));
    }
  }

  if (tasks.edges.some(t => t.node.type === 'single_choice' || t.node.type === 'multiple_choice')) {
    filterTypeOptions.push({ key: 'task_choice', value: 'Task has specific answer' });
    if (filterType === 'task_choice') {
      filterEntityOptions.push(...(
        tasks.edges.filter(m => m.node.type === 'single_choice' || m.node.type === 'multiple_choice')
          .map(m => ({ key: m.node.dbid, value: m.node.label }))
      ));
    }
  }

  console.log('team', team);

  return (
    <CustomFilter
      filterType={filterType}
      filterEntity={filterEntity}
      filterTypeOptions={filterTypeOptions}
      filterEntityOptions={filterEntityOptions}
      onChangeFilterType={handleChangeFilterType}
      onChangeFilterEntity={handleChangeFilterEntity}
    />
  );
};

export default createFragmentContainer(AddCustomFilters, graphql`
  fragment AddCustomFilters_team on Team {
    metadata: team_tasks(fieldset: "metadata", first: 10000) {
      edges {
        node {
          id
          dbid
          label
          options
          type
        }
      }
    }
    tasks: team_tasks(fieldset: "tasks", first: 10000) {
      edges {
        node {
          id
          dbid
          label
          options
          type
        }
      }
    }
  }
`);
