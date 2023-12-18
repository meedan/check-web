import React from 'react';
import PropTypes from 'prop-types';
import Box from '@material-ui/core/Box';
import VisibilityOffIcon from '../../../icons/visibility_off.svg';
import styles from './ItemThumbnail.module.css';
import MediaTypeDisplayIcon, { mediaTypeFromUrl } from '../../media/MediaTypeDisplayIcon';
import { getSuperAdminMask } from '../../../helpers';


const ItemThumbnail = ({
  type, picture, maskContent, url, superAdminMask,
}) => {
  // const [superAdminMask, setSuperAdminMask] = useState(false);

  // const superAdminMask2 = getSuperAdminMask();
  // eslint-disable-next-line
  console.log(getSuperAdminMask)
  // eslint-disable-next-line
  console.log(superAdminMask)

  if (!maskContent) {
    if (picture) {
      return (
        <Box display="flex" alignItems="center">
          <img
            className={styles.thumbnail}
            alt=""
            src={picture}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/image_placeholder.svg';
            }}
          />
        </Box>
      );
    }
    let mediaType = type;
    if (type === 'Link') {
      // use mediaTypeFromUrl to get the specific social icon
      mediaType = mediaTypeFromUrl(url);
    }
    // eslint-disable-next-line
    console.log("mediaType", mediaType)
    return (
      <Box display="flex" alignItems="center" justifyContent="center" className={`${styles.thumbnail}`}>
        <MediaTypeDisplayIcon mediaType={mediaType} fontSize="var(--iconSizeDefault)" />
      </Box>
    );
  }
  return (
    <Box display="flex" alignItems="center">
      <div className={styles.contentScreen}>
        <VisibilityOffIcon className={styles.icon} />
      </div>
    </Box>
  );
};

ItemThumbnail.propTypes = {
  superAdminMask: PropTypes.bool.isRequired,
  url: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  picture: PropTypes.string.isRequired,
  maskContent: PropTypes.bool.isRequired,
};

export default ItemThumbnail;
