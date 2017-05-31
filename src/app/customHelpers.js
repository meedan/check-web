import config from 'config';

function teamStatuses(team) {
  return team.translation_statuses;
}

function mediaStatuses(media) {
  return media.translation_statuses;
}

function mediaLastStatus(media) {
  return media.field_value || 'pending';
}

function stringHelper(key) {
  return {
    ABOUT_URL: 'https://meedan.com/bridge',
    CONTACT_HUMAN_URL: `mailto:${config.supportEmail}`,
    PP_URL: 'https://meedan.com/en/bridge/bridge_privacy.html',
    TOS_URL: 'https://meedan.com/en/bridge/bridge_tos.html',
    LOGO_URL: '/images/logo/bridge.svg',
  }[key];
}

export {
  teamStatuses,
  mediaStatuses,
  mediaLastStatus,
  stringHelper
};
