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

export {
  teamStatuses,
  mediaStatuses,
  mediaLastStatus
};
