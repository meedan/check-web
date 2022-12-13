import { getStatus, getStatusStyle } from '../../../helpers';

export function defaultOptions(media, language) {
  const { team } = media;
  const status = getStatus(
    media.team.verification_statuses,
    media.last_status,
    language,
    team.get_language,
  );
  const default_reports = team.get_report || {};
  const default_report = default_reports[language] || {};
  const isDefaultLanguage = (language === team.get_language || !language);
  const options = {
    language,
    use_introduction: isDefaultLanguage ? !!default_report.use_introduction : false,
    introduction: default_report.introduction || '',
    use_visual_card: false,
    image: (media.media && media.media.picture) ? media.media.picture : '',
    use_text_message: isDefaultLanguage,
    title: '',
    text: '',
    headline: '',
    description: '',
    status_label: status.label.substring(0, 16),
    theme_color: getStatusStyle(status, 'color'),
  };
  if (default_report.use_url) {
    options.url = default_report.url || '';
  }
  return options;
}

export function propsToData(props, language) {
  let { data } = props.media.dynamic_annotation_report_design || {};
  if (!data) {
    data = { options: defaultOptions(props.media, language) };
  } else {
    data = JSON.parse(JSON.stringify(data));
  }
  if (!data.state) {
    data.state = 'paused';
  }
  return data;
}

export function formatDate(date, language) {
  if (!language) {
    return '';
  }
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Intl.DateTimeFormat(language.replace('_', '-'), options).format(date);
}
