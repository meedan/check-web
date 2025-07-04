/* eslint-disable react/sort-prop-types */
import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames/bind';
import Tooltip from '../../cds/alerts-and-prompts/Tooltip';
import FacebookIcon from '../../../icons/facebook.svg';
import TwitterIcon from '../../../icons/twitter.svg';
import TelegramIcon from '../../../icons/telegram.svg';
import ViberIcon from '../../../icons/viber.svg';
import LineIcon from '../../../icons/line.svg';
import WhatsAppIcon from '../../../icons/whatsapp.svg';
import InstagramIcon from '../../../icons/instagram.svg';
import CheckChannels, { humanTiplineNames } from '../../../constants/CheckChannels';
import CheckPropTypes from '../../../CheckPropTypes';
import socialStyles from '../../../styles/css/socials.module.css';
import styles from './Card.module.css';

const ItemChannels = ({
  channels,
  className,
  sortMainFirst,
}) => {
  const tiplines = CheckChannels.TIPLINE;

  function getTiplineNameFromChannelNumber(channel) {
    const matchedTipline = Object.entries(tiplines).find(item => item[1] === channel.toString());
    return matchedTipline ? matchedTipline[0] : null;
  }

  function getHumanNameFromChannelNumber(channel) {
    const tipline = Object.entries(tiplines).find(item => item[1] === channel.toString());
    return tipline ? humanTiplineNames[tipline[0]] : null;
  }

  function ChannelIcon({ channel }) {
    const tipline = getTiplineNameFromChannelNumber(channel);

    function tiplineIcon(name) {
      switch (name) {
      case 'WHATSAPP': return <WhatsAppIcon className={socialStyles['whatsapp-green']} />;
      case 'MESSENGER': return <FacebookIcon className={socialStyles['facebook-blue']} />;
      case 'TWITTER': return <TwitterIcon className={socialStyles['x-black']} />;
      case 'TELEGRAM': return <TelegramIcon className={socialStyles['telegram-blue']} />;
      case 'VIBER': return <ViberIcon className={socialStyles['viber-purple']} />;
      case 'LINE': return <LineIcon className={socialStyles['viber-purple']} />;
      case 'INSTAGRAM': return <InstagramIcon className={socialStyles['instagram-pink']} />;
      default: return null;
      }
    }

    return (
      <Tooltip
        arrow
        placement="top"
        title={humanTiplineNames[tipline]}
      >
        <span>
          { tiplineIcon(tipline) }
        </span>
      </Tooltip>
    );
  }

  return (
    <div className={cx(styles.cardChannels, className)}>
      { /* return these blocks if we are sorting a main channel first with the remainder alphabetical */ }
      { sortMainFirst && <ChannelIcon channel={channels?.main} className="channel-icon--main" />}
      {
        sortMainFirst &&
        channels?.others
          ?.sort((a, b) => getHumanNameFromChannelNumber(a)?.localeCompare(getHumanNameFromChannelNumber(b)))
          .filter(channel => channel !== channels?.main)
          .map(channel => <ChannelIcon channel={channel} className="channel-icon--other" key={channel} />)
      }
      { /* return this block if we are just sorting alphabetical */ }
      {
        !sortMainFirst &&
        channels?.others
          ?.sort((a, b) => getHumanNameFromChannelNumber(a)?.localeCompare(getHumanNameFromChannelNumber(b)))
          .map(channel => <ChannelIcon channel={channel} className="channel-icon--other" key={channel} />)
      }
    </div>
  );
};

ItemChannels.defaultProps = {
  className: null,
  sortMainFirst: false,
  channels: {
    main: 0,
    others: [],
  },
};

ItemChannels.propTypes = {
  className: PropTypes.string,
  sortMainFirst: PropTypes.bool,
  channels: PropTypes.shape({
    main: CheckPropTypes.channel.isRequired,
    others: PropTypes.arrayOf(CheckPropTypes.channel),
  }),
};

export default ItemChannels;
