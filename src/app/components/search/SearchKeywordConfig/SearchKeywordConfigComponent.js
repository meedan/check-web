import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import MultiSelector from '../../layout/MultiSelector';

const SearchKeywordConfigComponent = ({
  onDismiss,
  onSubmit,
  query,
}) => {
  const defaultSelected = ['claim_description_content', 'fact_check_title', 'fact_check_summary', 'title', 'description'];
  const selected = query.keyword_fields?.fields || defaultSelected;
  const claimFactCheckOptions = [
    {
      value: 'claim_and_fact_check',
      label: (
        <FormattedMessage
          defaultMessage="Fact-check"
          description="Label for checkbox to toggle searching for keyword across Fact-checks"
          id="searchKeywordConfig.factCheck"
        />
      ),
      hasChildren: true,
    },
    {
      value: 'claim_description_content',
      label: (
        <FormattedMessage
          defaultMessage="Claim"
          description="Label for checkbox to toggle searching for keyword across claims"
          id="searchKeywordConfig.claimDescription"
        />
      ),
      parent: 'claim_and_fact_check',
    },
    {
      value: 'claim_description_context',
      label: (
        <FormattedMessage
          defaultMessage="Context"
          description="Label for checkbox to toggle searching for keyword across context data"
          id="searchKeywordConfig.claimDescriptionContext"
        />
      ),
      parent: 'claim_and_fact_check',
    },
    {
      value: 'fact_check_summary',
      label: (
        <FormattedMessage
          defaultMessage="Summary"
          description="Label for checkbox to toggle searching for keyword across summaries data"
          id="searchKeywordConfig.factCheckSummary"
        />
      ),
      parent: 'claim_and_fact_check',
    },
    {
      value: 'tags',
      label: (
        <FormattedMessage
          defaultMessage="Tags"
          description="Label for checkbox to toggle searching for keyword across tags"
          id="searchKeywordConfig.tags"
        />
      ),
      parent: 'claim_and_fact_check',
    },
    {
      value: 'fact_check_title',
      label: (
        <FormattedMessage
          defaultMessage="Title"
          description="Label for checkbox to toggle searching for keyword across Fact-check titles"
          id="searchKeywordConfig.factCheckTitle"
        />
      ),
      parent: 'claim_and_fact_check',
    },
    {
      value: 'fact_check_url',
      label: (
        <FormattedMessage
          defaultMessage="URLs"
          description="Label for checkbox to toggle searching for keyword across Fact-checks urls"
          id="searchKeywordConfig.factCheckUrl"
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
          defaultMessage="Media"
          description="Label for checkbox to toggle searching for keyword across medias"
          id="searchKeywordConfig.media"
        />
      ),
      hasChildren: true,
    },
    {
      value: 'description',
      label: (
        <FormattedMessage
          defaultMessage="Content"
          description="Label for checkbox to toggle searching for keyword across media contents"
          id="searchKeywordConfig.mediaContent"
        />
      ),
      parent: 'media',
    },
    {
      value: 'source_name',
      label: (
        <FormattedMessage
          defaultMessage="Source"
          description="Label for checkbox to toggle searching for keyword across titles of media sources"
          id="searchKeywordConfig.sourceTitle"
        />
      ),
      parent: 'media',
    },
    {
      value: 'title',
      label: (
        <FormattedMessage
          defaultMessage="Title"
          description="Label for checkbox to toggle searching for keyword across media titles"
          id="searchKeywordConfig.mediaTitle"
        />
      ),
      parent: 'media',
    },
    {
      value: 'url',
      label: (
        <FormattedMessage
          defaultMessage="URL"
          description="Label for checkbox to toggle searching for keyword across media URLs"
          id="searchKeywordConfig.mediaUrl"
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
          defaultMessage="Notes"
          description="Label for checkbox to toggle searching for keyword across notes (aka comments)"
          id="searchKeywordConfig.allNotes"
        />
      ),
    },
  ];
  const userRequestOptions = [
    {
      value: 'user_and_request',
      label: (
        <FormattedMessage
          defaultMessage="Request"
          description="Label for checkbox to toggle searching for keyword across Requests data"
          id="searchKeywordConfig.request"
        />
      ),
      hasChildren: true,
    },
    {
      value: 'request_username',
      label: (
        <FormattedMessage
          defaultMessage="Username / phone number"
          description="Label for checkbox to toggle searching for keyword across usernames and phone numbers in Requests"
          id="searchKeywordConfig.userNamePhoneNumber"
        />
      ),
      parent: 'user_and_request',
    },
    {
      value: 'request_content',
      label: (
        <FormattedMessage
          defaultMessage="Content"
          description="Label for checkbox to toggle searching for keyword across requests contents"
          id="searchKeywordConfig.requestContent"
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
      cancelLabel={<FormattedMessage defaultMessage="Cancel" description="Generic label for a button or link for a user to press when they wish to abort an in-progress operation" id="global.cancel" />}
      defaultValue={defaultSelected}
      options={options}
      resetLabel={
        <FormattedMessage
          defaultMessage="Reset"
          description="Label for reset options to default"
          id="SearchKeywordConfigComponent.resetLabel"
        />
      }
      selected={selected}
      submitLabel={<FormattedMessage defaultMessage="Update" description="Generic label for a button or link for a user to press when they wish to update an action" id="global.update" />}
      toggleAllLabel={
        <FormattedMessage
          defaultMessage="Select all"
          description="Label for checkbox to toggle selection of all checkboxes in menu"
          id="SearchKeywordConfigComponent.all"
        />
      }
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
