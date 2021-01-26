import React from 'react';
import styled from 'styled-components';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import Tasks from '../task/Tasks';
import {
  subheading2,
  body1,
  black87,
  black54,
  black16,
  units,
  brandSecondary,
} from '../../styles/js/shared';

const StyledAnnotationRow = styled.div`
  /* Tasks and metadata tab have shared styles */

  .annotation-header-row {
    padding: ${units(1)} ${units(3)};
    margin: 0;
    border-bottom: 1px solid ${brandSecondary};
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: ${black54};
    font: ${body1};
  }

  h2 {
    color: ${black87};
    flex: 1;
    font: ${subheading2};
    margin: 0;
  }

  .create-task {
    align-self: center;
    color: ${black16};
    cursor: pointer;
  }
`;

function SourceTasks({ source, fieldset }) {
  const { source_metadata: sourceMetadata } = source;

  return (
    <StyledAnnotationRow>
      <Tasks tasks={sourceMetadata.edges} media={source} fieldset={fieldset} />
    </StyledAnnotationRow>
  );
}

export default createFragmentContainer(SourceTasks, graphql`
  fragment SourceTasks_task on Task {
    id
    dbid
  }
  `);
