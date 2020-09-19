import { getStatus, getStatusStyle } from '../../../helpers';

export function defaultOptions(media, language) {
  const { team } = media;
  const status = getStatus(
    media.team.verification_statuses,
    media.last_status,
    language,
    team.get_language,
  );
  const teamUrl = team.contacts && team.contacts.edges[0] ?
    team.contacts.edges[0].node.web :
    window.location.href.match(/https?:\/\/[^/]+\/[^/]+/)[0];
  const default_reports = team.get_report || {};
  const default_report = default_reports[language] || {};
  const isDefaultLanguage = (language === team.get_language);
  return {
    language,
    use_disclaimer: !!default_report.use_disclaimer,
    disclaimer: default_report.disclaimer || '',
    use_introduction: isDefaultLanguage,
    introduction: default_report.introduction || '',
    use_visual_card: false,
    image: (media.media && media.media.picture) ? media.media.picture : '',
    use_text_message: isDefaultLanguage,
    title: '',
    text: '',
    headline: media.title ? media.title.substring(0, 85) : '',
    description: media.description ? media.description.substring(0, 240) : '',
    status_label: status.label.substring(0, 16),
    theme_color: getStatusStyle(status, 'color'),
    url: teamUrl ? teamUrl.substring(0, 40) : '',
  };
}

export function findReportIndex(data, language) {
  return data.options.findIndex(option => (option.language === language));
}

export function propsToData(props, language) {
  let { data } = props.media.dynamic_annotation_report_design || {};
  if (!data) {
    data = { options: [defaultOptions(props.media, language)] };
  } else {
    data = JSON.parse(JSON.stringify(data));
  }
  if (findReportIndex(data, language) === -1) {
    data.options.push(defaultOptions(props.media, language));
  }
  if (!data.state) {
    data.state = 'paused';
  }
  return data;
}

export function cloneData(data) {
  const clone = Object.assign({}, data);
  clone.options = [];
  data.options.forEach((option) => {
    clone.options.push(Object.assign({}, option));
  });
  return clone;
}

export function formatDate(date, language) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat(language.replace('_', '-'), options).format(date);
}
