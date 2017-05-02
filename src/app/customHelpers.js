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

export {
  teamStatuses,
  mediaStatuses,
  mediaLastStatus
};
