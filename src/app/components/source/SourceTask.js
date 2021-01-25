import { createFragmentContainer, graphql } from 'react-relay/compat';
import { Task } from '../task/Task';

export default createFragmentContainer(Task, graphql`
  fragment SourceTask_task on Task {
    id,
    dbid,
    label,
    type,
    description,
    fieldset,
  }
  `);
