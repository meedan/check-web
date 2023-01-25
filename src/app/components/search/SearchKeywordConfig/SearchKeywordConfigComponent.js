/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { MultiSelector } from '@meedan/check-ui';
import globalStrings from '../../../globalStrings';

const SearchKeywordConfigComponent = ({
  team,
  query,
  onDismiss,
  onSubmit,
}) => {
  let selected = ['claim_description', 'fact_check_title', 'fact_check_summary', 'title', 'description'];
  if (query.keyword_fields) {
    if (query.keyword_fields.fields) {
      selected = selected.concat(query.keyword_fields.fields);
    }
    if (query.keyword_fields.team_tasks) {
      selected = selected.concat(query.keyword_fields.team_tasks);
    }
  }
  let options = [{
    value: 'claim_and_fact_check',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.claimAndFactCheck"
        defaultMessage="Claim and fact-check"
      />
    ),
    hasChildren: true,
  },
  {
    value: 'claim_description',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.claimDescription"
        defaultMessage="Claim"
      />
    ),
    parent: 'claim_and_fact_check',
  },
  {
    value: 'claim_description_content',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.claimDescriptionContext"
        defaultMessage="Claim context"
      />
    ),
    parent: 'claim_and_fact_check',
  },
  {
    value: 'fact_check_title',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.factCheckTitle"
        defaultMessage="Fact-check title"
      />
    ),
    parent: 'claim_and_fact_check',
  },
  {
    value: 'fact_check_summary',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.factCheckSummary"
        defaultMessage="Fact-check summary"
      />
    ),
    parent: 'claim_and_fact_check',
  },
  {
    value: 'fact_check_url',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.mediaUrl"
        defaultMessage="Fact-check URL"
      />
    ),
    parent: 'claim_and_fact_check',
  },
  {
    value: 'tags',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.tags"
        defaultMessage="Tags"
      />
    ),
    parent: 'claim_and_fact_check',
  },
  {
    value: '',
    label: '',
  },
  {
    value: 'media',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.media"
        defaultMessage="Media"
      />
    ),
    hasChildren: true,
  },
  {
    value: 'title',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.mediaTitle"
        defaultMessage="Media title"
      />
    ),
    parent: 'media',
  },
  {
    value: 'description',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.mediaContent"
        defaultMessage="Media content"
      />
    ),
    parent: 'media',
  },
  {
    value: 'accounts',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.accounts"
        defaultMessage="Source"
      />
    ),
    parent: 'media',
  }];

  const wantedTeamTaskTypes = m => (
    m.node.type === 'free_text' ||
    m.node.type === 'single_choice' ||
    m.node.type === 'multiple_choice'
  );

  const wantedTeamTaskAssociatedTypes = m => (
    m.node.associated_type === 'ProjectMedia'
  );

  const formatOption = m => ({ value: `${m.node.dbid}`, label: m.node.label, parent: 'annotations' });

  const teamMetadata = team.metadata.edges
    .filter(wantedTeamTaskAssociatedTypes).filter(wantedTeamTaskTypes)
    .map(formatOption)
    .sort((a, b) => (a.label.localeCompare(b.label)));

  if (teamMetadata.length) {
    options = options.concat([{ value: '', label: '' }]);
    if (teamMetadata.length) {
      const label = <FormattedMessage id="searchKeywordConfig.annotation" defaultMessage="Annotation" description="Header before a listing of annotation options" />;
      options = options.concat([{ value: 'annotations', label, hasChildren: true }]);
      options = options.concat(teamMetadata);
    }
  }

  const handleChange = (values) => {
    const fields = [];
    const team_tasks = [];
    let keyword_fields = {};

    values.forEach((v) => {
      if (parseInt(v, 10)) {
        team_tasks.push(v);
      } else {
        fields.push(v);
      }
    });

    if (fields.length) {
      keyword_fields.fields = fields;
    }
    if (team_tasks.length) {
      keyword_fields.team_tasks = team_tasks;
    }
    const filteredOptions = options.filter(o => o.value !== '');
    if (values.length === filteredOptions.length) {
      keyword_fields = {};
    }

    onSubmit({ keyword_fields });
  };

  return (
    <MultiSelector
      allowToggleAll
      toggleAllLabel={<FormattedMessage id="MultiSelector.all" defaultMessage="Select All" />}
      submitLabel={<FormattedMessage {...globalStrings.update} />}
      cancelLabel={<FormattedMessage {...globalStrings.cancel} />}
      options={options}
      selected={selected}
      onDismiss={onDismiss}
      onSubmit={handleChange}
    />
  );
};

SearchKeywordConfigComponent.propTypes = {
  query: PropTypes.object.isRequired,
  onDismiss: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default SearchKeywordConfigComponent;
