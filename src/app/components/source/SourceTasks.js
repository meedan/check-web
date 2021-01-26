import React from 'react';
import Tasks from '../task/Tasks';

function SourceTasks({ source, fieldset }) {
  const { source_metadata } = source;
  const sourceMetadata = source_metadata ? source_metadata.edges : [];

  return (
    <Tasks tasks={sourceMetadata} media={source} fieldset={fieldset} noscroll />
  );
}

export default SourceTasks;
