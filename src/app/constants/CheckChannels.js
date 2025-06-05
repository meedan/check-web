const CheckChannels = {
  FETCH: '1',
  ANYTIPLINE: 'any_tipline',
  MANUAL: '0',
  BROWSER_EXTENSION: '2',
  API: '3',
  ZAPIER: '4',
  TIPLINE: {
    WHATSAPP: '5',
    MESSENGER: '6',
    TWITTER: '7',
    TELEGRAM: '8',
    VIBER: '9',
    LINE: '10',
    INSTAGRAM: '13',
  },
  WEB_FORM: '11',
  SHARED_DATABASE: '12',
};

const humanTiplineNames = {
  WHATSAPP: 'WhatsApp',
  MESSENGER: 'Messenger',
  TWITTER: 'X (Twitter)',
  TELEGRAM: 'Telegram',
  VIBER: 'Viber',
  LINE: 'Line',
  INSTAGRAM: 'Instagram',
};

export { humanTiplineNames };
export default CheckChannels;
