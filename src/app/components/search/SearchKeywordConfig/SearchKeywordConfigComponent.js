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
  let selected = ['claim_description_content', 'fact_check_title', 'fact_check_summary', 'title', 'description'];
  if (query.keyword_fields) {
    if (query.keyword_fields.fields) {
      selected = query.keyword_fields.fields;
    }
  }

  const claimFactCheckOptions = [
    {
      value: 'claim_and_fact_check',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.factCheck"
          defaultMessage="Fact-check"
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
      value: 'fact_check_title',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.factCheckTitle"
          defaultMessage="Title"
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
      value: 'description',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.mediaContent"
          defaultMessage="Content"
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
          id="searchKeywordConfig.request"
          defaultMessage="Rquest"
        />
      ),
      hasChildren: true,
    },
    {
      value: 'user_name',
      label: (
        <FormattedMessage
          id="searchKeywordConfig.userNamePhoneNumber"
          defaultMessage="Username / phone number"
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
