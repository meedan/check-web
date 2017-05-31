import config from 'config';

function teamStatuses(team) {
  return team.media_verification_statuses;
}

function mediaStatuses(media) {
  return media.verification_statuses;
}

function mediaLastStatus(media) {
  return media.last_status;
}

function stringHelper(key) {
  return {
    ABOUT_URL: 'https://meedan.com/check',
    CONTACT_HUMAN_URL: 'https://docs.google.com/forms/d/e/1FAIpQLSdctP7RhxeHjTnevnvRi6AKs4fX3wNnxecVdBFwKe7GRVcchg/viewform',
    PP_URL: 'https://meedan.com/en/check/check_privacy.html',
    TOS_URL: 'https://meedan.com/en/check/check_tos.html',
    LOGO_URL: '/images/logo/check.svg',
  }[key];
}

export {
  teamStatuses,
  mediaStatuses,
  mediaLastStatus,
  stringHelper
};
