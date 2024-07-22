import config from 'config'; // eslint-disable-line require-path-exists/exists

const customStrings = {
  check: {
    ABOUT_URL: 'https://meedan.com/check',
    ADMIN_EMAIL: 'check@meedan.com',
    CONTACT_HUMAN_URL: 'https://meedan.typeform.com/to/Tvf0b8',
    PP_URL: 'https://meedan.com/legal/privacy-policy',
    SUPPORT_EMAIL: 'check@meedan.com',
    PRIVACY_EMAIL: 'privacy@meedan.com',
    TOS_URL: 'https://meedan.com/legal/terms-of-service',
    LOGO_URL: '/images/logo/check.svg',
  },
};

function stringHelper(key) {
  return customStrings[config.appName][key];
}

// TODO finish removing customHelpers altogether
export {
  stringHelper, // eslint-disable-line import/prefer-default-export
};
