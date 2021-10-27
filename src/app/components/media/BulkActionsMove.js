import React from 'react';
import PropTypes from 'prop-types';
import { createFragmentContainer, graphql } from 'react-relay/compat';
import { FormattedMessage } from 'react-intl';
import { MultiSelector } from '@meedan/check-ui';
import globalStrings from '../../globalStrings';

const BulkActionsMove = ({
  excludeProjectDbids,
  onDismiss,
  onSubmit,
  selectedMedia,
  team,
}) => {
  const [selected, setSelected] = React.useState([]);

  const options = team.projects.edges
    .filter(({ node }) => !excludeProjectDbids.includes(node.dbid))
    .map(p => ({ label: p.node.title, value: p.node.dbid.toString() }));

  const handleSelectChange = value => setSelected(value);
  const handleSubmit = () => {
    const dstProj = team.projects.edges.find(p => p.node.dbid.toString() === selected);
    if (dstProj) onSubmit(dstProj.node);
  };

  return (
    <FormattedMessage id="multiSelector.search" defaultMessage="Search…">
      {placeholder => (
        <MultiSelector
          allowSearch
          cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
          inputPlaceholder={placeholder}
          options={options}
          selected={selected}
          onDismiss={onDismiss}
          onSubmit={handleSubmit}
          onSelectChange={handleSelectChange}
          notFoundLabel={
            <FormattedMessage
              id="bulkActionsMove.notFound"
              defaultMessage="No folders found"
              description="Displayed when no folder names match search input"
            />
          }
          single
          submitLabel={
            <FormattedMessage
              id="bulkActionsMove.submitLabel"
              defaultMessage="{numItems, plural, one {Move 1 item} other {Move # items}}"
              values={{ numItems: selectedMedia.length }}
              description="Button for commiting the action of moving of a number of items in bulk"
            />
          }
        />
      )}
    </FormattedMessage>
  );
};

BulkActionsMove.propTypes = {
  onDismiss: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedMedia: PropTypes.arrayOf(PropTypes.string.isRequired).isRequired,
  team: PropTypes.shape({
    projects: PropTypes.object.isRequired,
  }).isRequired,
};

export default createFragmentContainer(BulkActionsMove, graphql`
  fragment BulkActionsMove_team on Team {
    projects(first: 10000) {
      edges {
        node {
          id
          dbid
          title
          project_group_id
          medias_count  # For optimistic updates when adding/moving items
          search_id  # For optimistic updates when adding/moving items
        }
      }
    }
    project_groups(first: 10000) {
      edges {
        node {
          dbid
          title
        }
      }
    }
  }
`);
