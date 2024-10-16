import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import BulletSeparator from '../../layout/BulletSeparator';
import ButtonMain from '../../cds/buttons-checkboxes-chips/ButtonMain';
import OpenInNewIcon from '../../../icons/open_in_new.svg';
import ItemChannels from '../../cds/media-cards/ItemChannels';
import SuggestionsCount from '../../cds/media-cards/SuggestionsCount';
import MediaCount from '../../cds/media-cards/MediaCount';
import RequestsCount from '../../cds/media-cards/RequestsCount';
import LastRequestDate from '../../cds/media-cards/LastRequestDate';
import Language from '../../cds/media-cards/Language';
import TagList from '../../cds/menus-lists-dialogs/TagList';
import styles from './ItemCard.module.css';

const SharedItemCardFooter = ({
  channels,
  languageCode,
  lastRequestDate,
  mediaCount,
  mediaType,
  onChangeTags,
  onSeeMore,
  readOnly,
  requestsCount,
  suggestionsCount,
  tags,
  teamSlug,
}) => (
  <BulletSeparator
    className={styles.bulletSeparator}
    compact
    details={[
      languageCode && (
        <Language languageCode={languageCode} />
      ),
      tags && onChangeTags && (
        <TagList
          maxTags={5}
          readOnly={readOnly}
          setTags={onChangeTags}
          tags={tags}
          teamSlug={teamSlug}
        />
      ),
      mediaCount !== null && (
        <MediaCount
          mediaCount={mediaCount}
          mediaType={mediaType}
        />
      ),
      suggestionsCount !== null && (
        <SuggestionsCount
          suggestionsCount={suggestionsCount}
        />
      ),
      requestsCount !== null && (
        <RequestsCount
          requestsCount={requestsCount}
        />
      ),
      lastRequestDate && requestsCount > 0 && (
        <LastRequestDate
          lastRequestDate={lastRequestDate}
        />
      ),
      channels && <ItemChannels channels={channels} sortMainFirst />,
      onSeeMore && (
        <ButtonMain
          iconLeft={<OpenInNewIcon />}
          label={<FormattedMessage defaultMessage="more" description="Label of the a button that opens more details about a feed item" id="sharedItemCardFooter.more" />}
          size="small"
          theme="text"
          variant="contained"
          onClick={onSeeMore}
        />),
    ]}
  />
);

SharedItemCardFooter.defaultProps = {
  mediaCount: null,
  mediaType: null,
  readOnly: false,
  requestsCount: null,
  suggestionsCount: null,
  languageCode: null,
  lastRequestDate: null,
  tags: null,
  onChangeTags: null,
  channels: null,
  onSeeMore: null,
};

SharedItemCardFooter.propTypes = {
  channels: PropTypes.exact({
    main: PropTypes.number,
    others: PropTypes.arrayOf(PropTypes.number),
  }),
  languageCode: PropTypes.string,
  lastRequestDate: PropTypes.instanceOf(Date),
  mediaCount: PropTypes.number,
  mediaType: PropTypes.string,
  readOnly: PropTypes.bool,
  requestsCount: PropTypes.number,
  suggestionsCount: PropTypes.number,
  tags: PropTypes.arrayOf(PropTypes.string),
  onChangeTags: PropTypes.func,
  onSeeMore: PropTypes.func,
};

export default SharedItemCardFooter;
