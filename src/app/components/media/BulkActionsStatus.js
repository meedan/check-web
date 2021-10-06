import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { MultiSelector } from '@meedan/check-ui';

const BulkActionsStatus = ({ team }) => {
  const selected = [];
  const options = team.verification_statuses.statuses.map(st => ({ label: st.label, value: st.id }));
  const handleSelect = () => {};

  return (
    <FormattedMessage id="tagMenu.search" defaultMessage="Search…">
      {placeholder => (
        <MultiSelector
          allowSearch
          inputPlaceholder={placeholder}
          selected={selected}
          single
          options={options}
          onSubmit={handleSelect}
          notFoundLabel={
            <FormattedMessage
              id="tagMenu.notFound"
              defaultMessage="No tags found"
            />
          }
          submitLabel={
            <FormattedMessage
              id="tagMenu.submit"
              defaultMessage="Tag"
              description="Verb, infinitive form. Button to commit action of tagging an item"
            />
          }
        />
      )}
    </FormattedMessage>
  );
};

export default createFragmentContainer(BulkActionsStatus, graphql`
  fragment BulkActionsStatus_team on Team {
    verification_statuses
  }
`);
