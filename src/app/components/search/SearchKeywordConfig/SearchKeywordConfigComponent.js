/* eslint-disable @calm/react-intl/missing-attribute */
import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { MultiSelector } from '@meedan/check-ui';
import globalStrings from '../../../globalStrings';

const SearchKeywordConfigComponent = ({
  query,
  onDismiss,
  onSubmit,
}) => {
  let selected = ['claim_description', 'fact_check_title', 'fact_check_summary', 'title', 'description'];
  if (query.keyword_fields) {
    if (query.keyword_fields.fields) {
      selected = selected.concat(query.keyword_fields.fields);
    }
  }

  const claimFactCheckOptions = [
    {
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
          id="searchKeywordConfig.factCheckUrl"
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
      value: 'comments',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.notes"
          defaultMessage="Notes"
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
      value: 'url',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.mediaUrl"
          defaultMessage="Media URL"
        />
      ),
      parent: 'media',
    },
    {
      value: 'source_title',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.sourceTitle"
          defaultMessage="Source title"
        />
      ),
      parent: 'media',
    },
  ];
  const userRequestOptions = [
    {
      value: 'user_and_request',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.userAndRequest"
          defaultMessage="User & Rquest"
        />
      ),
      hasChildren: true,
    },
    {
      value: 'user_name',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.userNamePhoneNumber"
          defaultMessage="Username or phone number"
        />
      ),
      parent: 'user_and_request',
    },
    {
      value: 'request_content',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.requestContent"
          defaultMessage="Request content"
        />
      ),
      parent: 'user_and_request',
    },
  ];
  const hrOption = [{ value: '', label: '' }];
  const options = [...claimFactCheckOptions, ...hrOption, ...mediaOptions, ...hrOption, ...userRequestOptions];

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
