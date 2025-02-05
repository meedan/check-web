import React from 'react';
import { FormattedMessage, injectIntl, defineMessages } from 'react-intl';
import MultiSelectFilter from '../MultiSelectFilter';
import DescriptionIcon from '../../../icons/description.svg';

const messages = defineMessages({
  claim: {
    id: 'search.showClaims',
    defaultMessage: 'Text',
    description: 'Describes media type Text',
  },
  image: {
    id: 'search.showImages',
    defaultMessage: 'Image',
    description: 'Describes media type Image',
  },
  video: {
    id: 'search.showVideos',
    defaultMessage: 'Video',
    description: 'Describes media type Video',
  },
  audio: {
    id: 'search.showAudios',
    defaultMessage: 'Audio',
    description: 'Describes media type Audio',
  },
  socialMedia: {
    id: 'search.socialMedia',
    defaultMessage: 'Social media',
    description: 'Allow user to filter by social media links',
  },
  facebook: {
    id: 'search.facebook',
    defaultMessage: 'Facebook post',
    description: 'Allow user to filter items by facebook posts',
  },
  twitter: {
    id: 'search.twitter',
    defaultMessage: 'X (Twitter) post',
    description: 'Allow user to filter items by x (twitter) posts',
  },
  tiktok: {
    id: 'search.tiktok',
    defaultMessage: 'TikTok post',
    description: 'Allow user to filter items by tiktok posts',
  },
  youtube: {
    id: 'search.youtube',
    defaultMessage: 'Youtube video',
    description: 'Allow user to filter items by youtube videos',
  },
  instagram: {
    id: 'search.instagram',
    defaultMessage: 'Instagram post',
    description: 'Allow user to filter items by instagram posts',
  },
  telegram: {
    id: 'search.telegram',
    defaultMessage: 'Telegram',
    description: 'Allow user to filter items by Telegram posts',
  },
  webLink: {
    id: 'search.webLink',
    defaultMessage: 'webLink',
    description: 'Allow user to filter items by links of type page',
  },
});

const SearchFieldMediaType = ({
  intl,
  onChange,
  onRemove,
  query,
  readOnly,
}) => {
  const types = [
    { value: 'audios', label: intl.formatMessage(messages.audio) },
    { value: 'images', label: intl.formatMessage(messages.image) },
    { value: 'videos', label: intl.formatMessage(messages.video) },
    { value: '', label: '' },
    { value: 'social_media', label: intl.formatMessage(messages.socialMedia), hasChildren: true },
    { value: 'facebook', label: intl.formatMessage(messages.facebook), parent: 'social_media' },
    { value: 'instagram', label: intl.formatMessage(messages.instagram), parent: 'social_media' },
    { value: 'telegram', label: intl.formatMessage(messages.telegram), parent: 'social_media' },
    { value: 'tiktok', label: intl.formatMessage(messages.tiktok), parent: 'social_media' },
    { value: 'twitter', label: intl.formatMessage(messages.twitter), parent: 'social_media' },
    { value: 'youtube', label: intl.formatMessage(messages.youtube), parent: 'social_media' },
    { value: '', label: '' },
    { value: 'claims', label: intl.formatMessage(messages.claim) },
    { value: 'weblink', label: intl.formatMessage(messages.webLink) },
  ];

  const handleChange = (selected) => {
    let newSelected = [...selected];
    if (selected.includes('social_media')) {
      const socialMediaTypes = types.filter(type => type.parent === 'social_media').map(type => type.value);
      newSelected = selected.filter(type => !socialMediaTypes.includes(type));
    }
    onChange(newSelected);
  };

  return (
    <FormattedMessage defaultMessage="Media in cluster is" description="Prefix label for field to filter by media type" id="search.show">
      { label => (
        <MultiSelectFilter
          allowSearch={false}
          icon={<DescriptionIcon />}
          label={label}
          options={types}
          readOnly={readOnly}
          selected={query.show}
          onChange={handleChange}
          onRemove={onRemove}
        />
      )}
    </FormattedMessage>
  );
};

export default injectIntl(SearchFieldMediaType);
