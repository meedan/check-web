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
  let selected = [];
  if (query.keyword_fields) {
    if (query.keyword_fields.fields) {
      selected = selected.concat(query.keyword_fields.fields);
    }
    if (query.keyword_fields.team_tasks) {
      selected = selected.concat(query.keyword_fields.team_tasks);
    }
  }
  let options = [{
    value: '',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.item"
        defaultMessage="Item"
      />
    ),
  },
  {
    value: 'title',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.mediaTitle"
        defaultMessage="Media title"
      />
    ),
  },
  {
    value: 'description',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.mediaContent"
        defaultMessage="Media content"
      />
    ),
  },
  {
    value: 'url',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.mediaUrl"
        defaultMessage="Media URL"
      />
    ),
  },
  {
    value: 'analysis_title',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.analysisTitle"
        defaultMessage="Analysis title"
      />
    ),
  },
  {
    value: 'analysis_description',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.analysisContent"
        defaultMessage="Analysis content"
      />
    ),
  },
  {
    value: 'tags',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.tags"
        defaultMessage="Tags"
      />
    ),
  },
  {
    value: 'accounts',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.accounts"
        defaultMessage="Source"
      />
    ),
  },
  {
    value: 'extracted_text',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.ocr"
        defaultMessage="Extracted text (OCR)"
      />
    ),
  },
  {
    value: 'claim_description_content',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.claimDescription"
        defaultMessage="Claim description"
      />
    ),
  },
  {
    value: 'fact_check_title',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.factCheckTitle"
        defaultMessage="Fact-check title"
      />
    ),
  },
  {
    value: 'fact_check_summary',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.factCheckSummary"
        defaultMessage="Fact-check summary"
      />
    ),
  },
  {
    value: '',
    label: '',
  },
  {
    value: 'metadata_answers',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.allMetadataAnswers"
        defaultMessage="All metadata answers"
      />
    ),
  },
  {
    value: 'comments',
    label: (
      <FormattedMessage
        id="searchKeywordConfig.allNotes"
        defaultMessage="All notes"
      />
    ),
  }];

  const wantedTeamTaskTypes = m => (
    m.node.type === 'free_text' ||
    m.node.type === 'single_choice' ||
    m.node.type === 'multiple_choice'
  );

  const wantedTeamTaskAssociatedTypes = m => (
    m.node.associated_type === 'ProjectMedia'
  );

  const formatOption = m => ({ value: `${m.node.dbid}`, label: m.node.label });

  const teamMetadata = team.metadata.edges
    .filter(wantedTeamTaskAssociatedTypes).filter(wantedTeamTaskTypes)
    .map(formatOption);

  if (teamMetadata.length) {
    options = options.concat([{ value: '', label: '' }]);
    if (teamMetadata.length) {
      const label = <FormattedMessage id="searchKeywordConfig.annotation" defaultMessage="Annotation" description="Header before a listing of annotation options" />;
      options = options.concat([{ value: '', label }]);
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
      defaultAllSelected
      toggleAllLabel={<FormattedMessage id="MultiSelector.all" defaultMessage="Search All" />}
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
