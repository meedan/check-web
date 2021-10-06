import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { MultiSelector } from '@meedan/check-ui';

const BulkActionsTag = ({ team }) => {
  const selected = [];
  const options = team.tag_texts.edges.map(tt => ({ label: tt.node.text, value: tt.node.text }));
  const handleSelect = () => {};

  return (
    <FormattedMessage id="tagMenu.search" defaultMessage="Search…">
      {placeholder => (
        <MultiSelector
          allowSearch
          inputPlaceholder={placeholder}
          selected={selected}
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

export default createFragmentContainer(BulkActionsTag, graphql`
  fragment BulkActionsTag_team on Team {
    tag_texts(first: 10000) {
      edges {
        node {
          text
        }
      }
    }
  }
`);
