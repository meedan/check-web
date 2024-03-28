import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import MultiSelector from '../../layout/MultiSelector';

const SearchKeywordConfigComponent = ({
  query,
  onDismiss,
  onSubmit,
}) => {
  const defaultSelected = ['claim_description_content', 'fact_check_title', 'fact_check_summary', 'title', 'description'];
  const selected = query.keyword_fields?.fields || defaultSelected;
  const claimFactCheckOptions = [
    {
      value: 'claim_and_fact_check',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.factCheck"
          defaultMessage="Fact-check"
          description="Label for checkbox to toggle searching for keyword across Fact-checks"
        />
      ),
      hasChildren: true,
    },
    {
      value: 'claim_description_content',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.claimDescription"
          defaultMessage="Claim"
          description="Label for checkbox to toggle searching for keyword across claims"
        />
      ),
      parent: 'claim_and_fact_check',
    },
    {
      value: 'claim_description_context',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.claimDescriptionContext"
          defaultMessage="Context"
          description="Label for checkbox to toggle searching for keyword across context data"
        />
      ),
      parent: 'claim_and_fact_check',
    },
    {
      value: 'fact_check_summary',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.factCheckSummary"
          defaultMessage="Summary"
          description="Label for checkbox to toggle searching for keyword across summaries data"
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
          description="Label for checkbox to toggle searching for keyword across tags"
        />
      ),
      parent: 'claim_and_fact_check',
    },
    {
      value: 'fact_check_title',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.factCheckTitle"
          defaultMessage="Title"
          description="Label for checkbox to toggle searching for keyword across Fact-check titles"
        />
      ),
      parent: 'claim_and_fact_check',
    },
    {
      value: 'fact_check_url',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.factCheckUrl"
          defaultMessage="URLs"
          description="Label for checkbox to toggle searching for keyword across Fact-checks urls"
        />
      ),
      parent: 'claim_and_fact_check',
    },
  ];
  const mediaOptions = [
    {
      value: 'media',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.media"
          defaultMessage="Media"
          description="Label for checkbox to toggle searching for keyword across medias"
        />
      ),
      hasChildren: true,
    },
    {
      value: 'description',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.mediaContent"
          defaultMessage="Content"
          description="Label for checkbox to toggle searching for keyword across media contents"
        />
      ),
      parent: 'media',
    },
    {
      value: 'source_name',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.sourceTitle"
          defaultMessage="Source"
          description="Label for checkbox to toggle searching for keyword across titles of media sources"
        />
      ),
      parent: 'media',
    },
    {
      value: 'title',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.mediaTitle"
          defaultMessage="Title"
          description="Label for checkbox to toggle searching for keyword across media titles"
        />
      ),
      parent: 'media',
    },
    {
      value: 'url',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.mediaUrl"
          defaultMessage="URL"
          description="Label for checkbox to toggle searching for keyword across media URLs"
        />
      ),
      parent: 'media',
    },
  ];
  const noteOption = [
    {
      value: 'comments',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.allNotes"
          defaultMessage="Notes"
          description="Label for checkbox to toggle searching for keyword across notes (aka comments)"
        />
      ),
    },
  ];
  const userRequestOptions = [
    {
      value: 'user_and_request',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.request"
          defaultMessage="Request"
          description="Label for checkbox to toggle searching for keyword across Requests data"
        />
      ),
      hasChildren: true,
    },
    {
      value: 'request_username',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.userNamePhoneNumber"
          defaultMessage="Username / phone number"
          description="Label for checkbox to toggle searching for keyword across usernames and phone numbers in Requests"
        />
      ),
      parent: 'user_and_request',
    },
    {
      value: 'request_content',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.requestContent"
          defaultMessage="Content"
          description="Label for checkbox to toggle searching for keyword across requests contents"
        />
      ),
      parent: 'user_and_request',
    },
  ];
  const hrOption = [{ value: '', label: '' }];
  const options = [
    ...claimFactCheckOptions,
    ...hrOption,
    ...mediaOptions,
    ...hrOption,
    ...noteOption,
    ...hrOption,
    ...userRequestOptions,
  ];

  const handleChange = (values) => {
    const fields = [];
    const keyword_fields = {};
    values.forEach((v) => {
      fields.push(v);
    });
    if (fields.length) {
      keyword_fields.fields = fields;
    }
    onSubmit({ keyword_fields });
  };

  return (
    <MultiSelector
      allowToggleAll
      toggleAllLabel={
        <FormattedMessage
          id="SearchKeywordConfigComponent.all"
          defaultMessage="Select all"
          description="Label for checkbox to toggle selection of all checkboxes in menu"
        />
      }
      submitLabel={<FormattedMessage id="global.update" defaultMessage="Update" description="Generic label for a button or link for a user to press when they wish to update an action" />}
      cancelLabel={<FormattedMessage id="global.cancel" defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" />}
      resetLabel={
        <FormattedMessage
          id="SearchKeywordConfigComponent.resetLabel"
          defaultMessage="Reset"
          description="Label for reset options to default"
        />
      }
      options={options}
      selected={selected}
      defaultValue={defaultSelected}
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
