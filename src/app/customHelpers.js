import config from 'config';

const customHelpers = {
  bridge: {
    teamStatuses: function(team) {
      return team.translation_statuses;
    },
    mediaStatuses: function(media) {
      return media.translation_statuses;
    },
    mediaLastStatus: function(media) {
      return media.field_value || 'pending';
    },
  },
  check: {
    teamStatuses: function(team){
      return team.media_verification_statuses;
    },
    mediaStatuses: function(media) {
      return media.verification_statuses;
    },
    mediaLastStatus: function(media) {
      return media.last_status;
    },
  },
};

const customStrings = {
  bridge: {
    ABOUT_URL: 'https://meedan.com/bridge',
    CONTACT_HUMAN_URL: `mailto:${config.supportEmail}`,
    PP_URL: 'https://meedan.com/en/bridge/bridge_privacy.html',
    TOS_URL: 'https://meedan.com/en/bridge/bridge_tos.html',
    LOGO_URL: '/images/logo/bridge.svg',
  },
  check: {
    ABOUT_URL: 'https://meedan.com/check',
    CONTACT_HUMAN_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSdctP7RhxeHjTnevnvRi6AKs4fX3wNnxecVdBFwKe7GRVcchg/viewform',
    PP_URL: 'https://meedan.com/en/check/check_privacy.html',
    TOS_URL: 'https://meedan.com/en/check/check_tos.html',
    LOGO_URL: '/images/logo/check.svg',
  },
};

function resolveHelper(name, args){
  return customHelpers[config.appName][name].apply(this, args);
}

function teamStatuses(team) {
  return resolveHelper('teamStatuses', arguments);
}

function mediaStatuses(media) {
  return resolveHelper('mediaStatuses', arguments);
}

function mediaLastStatus(media) {
  return resolveHelper('mediaLastStatus', arguments);
}

function stringHelper(key) {
  return customStrings[config.appName][key];
}

export {
  teamStatuses,
  mediaStatuses,
  mediaLastStatus,
  stringHelper
};
