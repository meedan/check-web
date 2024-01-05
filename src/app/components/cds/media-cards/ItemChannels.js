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
import CheckChannels from '../../../CheckChannels';
import styles from './Card.module.css';

const ItemChannels = ({
  className,
  sortMainFirst,
  channels,
}) => {
  const tiplines = CheckChannels.TIPLINE;

  const humanTiplineNames = {
    WHATSAPP: 'WhatsApp',
    MESSENGER: 'Messenger',
    TWITTER: 'X (Twitter)',
    TELEGRAM: 'Telegram',
    VIBER: 'Viber',
    LINE: 'Line',
    INSTAGRAM: 'Instagram',
  };

  function getTiplineNameFromChannelNumber(channel) {
    return Object.entries(tiplines).find(item => item[1] === channel.toString())[0];
  }

  function getHumanNameFromChannelNumber(channel) {
    const tipline = Object.entries(tiplines).find(item => item[1] === channel.toString())[0];
    return humanTiplineNames[tipline];
  }

  function ChannelIcon({ channel }) {
    const tipline = getTiplineNameFromChannelNumber(channel);

    function tiplineIcon(name) {
      switch (name) {
      case 'WHATSAPP': return <WhatsAppIcon style={{ color: 'var(--whatsappGreen)' }} />;
      case 'MESSENGER': return <FacebookIcon style={{ color: 'var(--facebookBlue)' }} />;
      case 'TWITTER': return <TwitterIcon style={{ color: 'var(--xBlack)' }} />;
      case 'TELEGRAM': return <TelegramIcon style={{ color: 'var(--telegramBlue)' }} />;
      case 'VIBER': return <ViberIcon style={{ color: 'var(--viberPurple)' }} />;
      case 'LINE': return <LineIcon style={{ color: 'var(--lineGreen)' }} />;
      case 'INSTAGRAM': return <InstagramIcon style={{ color: 'var(--instagramPink)' }} />;
      default: return null;
      }
    }

    return (
      <Tooltip
        arrow
        title={humanTiplineNames[tipline]}
        placement="top"
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
      { sortMainFirst && <ChannelIcon channel={channels.main} />}
      {
        sortMainFirst && channels.others
          .sort((a, b) => getHumanNameFromChannelNumber(a).localeCompare(getHumanNameFromChannelNumber(b)))
          .filter(channel => channel !== channels.main)
          .map(channel => <ChannelIcon channel={channel} />)
      }
      { /* return this block if we are just sorting alphabetical */ }
      {
        !sortMainFirst && channels.others
          .sort((a, b) => getHumanNameFromChannelNumber(a).localeCompare(getHumanNameFromChannelNumber(b)))
          .map(channel => <ChannelIcon channel={channel} />)
      }
    </div>
  );
};

ItemChannels.defaultProps = {
  className: null,
  sortMainFirst: false,
};

ItemChannels.propTypes = {
  className: PropTypes.string,
  sortMainFirst: PropTypes.bool,
  channels: PropTypes.exact({
    main: PropTypes.number,
    others: PropTypes.arrayOf(PropTypes.number),
  }).isRequired,
};

export default ItemChannels;
