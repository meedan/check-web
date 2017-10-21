import React from 'react';
import { expect } from 'chai';
import { mountWithIntl } from './helpers/intl-test';
import WebPageMediaCard from '../../src/app/components/media/WebPageMediaCard.js';

describe('<WebPageMediaCard />', () => {
  const webPageWithGoodPicture = {
    media: { __dataID__: 'UHJvamVjdE1lZGlhLzEw\n', id: 'UHJvamVjdE1lZGlhLzEw\n', dbid: 10, quote: null, published: '1506728130', archived: false, url: 'https://meedan.com/en/', embed: '{"published_at":"","username":"","title":"Meedan","description":"A team of designers, technologists and journalists who focus on open source investigation of digital media and crowdsourced translation of social media.","picture":"http://meedan.com/images/logos/meedan-logo-600@2x.png","author_url":"https://meedan.com","author_picture":"http://meedan.com/images/logos/meedan-logo-600@2x.png","author_name":"Meedan","raw":{"metatags":[{"charset":"UTF-8"},{"name":"viewport","content":"width=device-wid...', last_status: 'undetermined', field_value: 'pending', log_count: 0, domain: 'meedan.com', permissions: '{"read ProjectMedia":true,"update ProjectMedia":true,"destroy ProjectMedia":true,"create Comment":true,"create Flag":false,"create Status":true,"create Tag":true,"create Dynamic":true,"create Task":true,"embed ProjectMedia":true,"restore ProjectMedia":false}', project: {}, project_id: 1, project_source: {}, pusher_channel: 'check-channel-9527305ce64db9f407aaeebb36317bd6', verification_statuses: '{"label":"Status","default":"undetermined","statuses":[{"description":"Default, just added to Check, no work has started","id":"undetermined","label":"Unstarted","style":{"backgroundColor":"#518FFF","color":"#518FFF"}},{"description":"No conclusion can be made with the available evidence","id":"not_applicable","label":"Inconclusive","style":{"backgroundColor":"#9e9e9e","color":"#9e9e9e"}},{"description":"Work has begun, but no conclusion made yet","id":"in_progress","label":"In Progress","style"...', translation_statuses: '{"label":"translation_status","default":"pending","statuses":[{"description":"Pending","id":"pending","label":"Pending","style":""},{"description":"In progress","id":"in_progress","label":"In progress","style":""},{"description":"Translated","id":"translated","label":"Translated","style":""},{"description":"Ready","id":"ready","label":"Ready","style":""},{"description":"Error","id":"error","label":"Error","style":""}]}', overridden: '{"title":false,"description":false,"username":false}', language: null, language_code: null, media: {}, user: {}, last_status_obj: {}, translation_status: {}, translations: {}, tags: {}, tasks: {}, log: {}, team: {}, embed_path: '' },
    data: { published_at: '', username: '', title: 'Meedan', description: 'A team of designers, technologists and journalists who focus on open source investigation of digital media and crowdsourced translation of social media.', picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png', author_url: 'https://meedan.com', author_picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png', author_name: 'Meedan', raw: {}, url: 'https://meedan.com/en/', provider: 'page', type: 'item', parsed_at: '2017-09-29T23:35:29.690+00:00', favicon: 'https://www.google.com/s2/favicons?domain_url=meedan.com/en/', embed_tag: '<script src="http://pender:3200/api/medias.js?url=https%3A%2F%2Fmeedan.com%2Fen%2F" type="text/javascript"></script>', refreshes_count: 1,
    },
  };

  const webPageWithScreenshotPicture = {
    media: { id: 'UHJvamVjdE1lZGlhLzI2\n', dbid: 26, quote: null, published: '1508470916', archived: false, url: 'http://idlewords.com/2006/04/argentina_on_two_steaks_a_day.htm', last_status: 'undetermined', field_value: 'pending', log_count: 0, domain: 'idlewords.com', project: {}, project_id: 1, project_source: {}, language: null, language_code: null, media: {}, user: {}, last_status_obj: {}, translation_status: {}, translations: {}, tags: {}, tasks: {}, log: {}, team: {}, embed_path: '' }, data: { published_at: '', username: '', title: 'Argentina On Two Steaks A Day (Idle Words)', description: '', picture: 'http://pender:3200/screenshots/http-idlewords-com-2006-04-argentina_on_two_steaks_a_day-htm.png', author_url: 'http://idlewords.com', author_picture: 'http://pender:3200/screenshots/http-idlewords-com-2006-04-argentina_on_two_steaks_a_day-htm.png', author_name: 'Argentina On Two Steaks A Day (Idle Words)', raw: {}, url: 'http://idlewords.com/2006/04/argentina_on_two_steaks_a_day.htm', provider: 'page', type: 'item', parsed_at: '2017-10-20T03:41:55.986+00:00', favicon: 'https://www.google.com/s2/favicons?domain_url=idlewords.com/2006/04/argentina_on_two_steaks_a_day.htm', embed_tag: '<script src="http://pender:3200/api/medias.js?url=http%3A%2F%2Fidlewords.com%2F2006%2F04%2Fargentina_on_two_steaks_a_day.htm" type="text/javascript"></script>', refreshes_count: 1 } };

  it('renders a picture if there is a good picture', () => {
    const card = mountWithIntl(
      <WebPageMediaCard
        media={webPageWithGoodPicture.media}
        data={webPageWithGoodPicture.data}
      />,
        );

    expect(card.find('img').html()).to.contain(`src="${webPageWithGoodPicture.data.picture}"`);
  });

  it('renders a favicon if the picture is a screenshot', () => {
    const card = mountWithIntl(
      <WebPageMediaCard
        media={webPageWithScreenshotPicture.media}
        data={webPageWithScreenshotPicture.data}
      />,
        );

    expect(card.find('img').html()).to.contain(`src="${webPageWithScreenshotPicture.data.favicon}"`);
  });
});
