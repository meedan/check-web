import React from 'react';
import { mountWithIntl } from './helpers/intl-test';
import WebPageMediaCard from '../../src/app/components/media/WebPageMediaCard.js';
import CheckArchivedFlags from '../../src/app/CheckArchivedFlags';

describe('<WebPageMediaCard />', () => {
  const webPageWithGoodPicture = {
    media: {
      __dataID__: 'UHJvamVjdE1lZGlhLzEw\n',
      id: 'UHJvamVjdE1lZGlhLzEw\n',
      dbid: 10,
      quote: null,
      published: '1506728130',
      archived: CheckArchivedFlags.NONE,
      url: 'https://meedan.com/en/',
      picture: "http://meedan.com/images/logos/meedan-logo-600@2x.png",
      metadata: {
        published_at: "",
        username: "",
        title: "Meedan",
        description: "A team of designers, technologists and journalists who focus on open source investigation of digital media and crowdsourced translation of social media.",
        picture: "http://meedan.com/images/logos/meedan-logo-600@2x.png",
        author_url: "https://meedan.com",
        author_picture: "http://meedan.com/images/logos/meedan-logo-600@2x.png",
        author_name: "Meedan",
      },
      media: {
        metadata: {
          title: "Web Page with a Good Picture",
        }
      }
    },
    data: {
      published_at: '',
      username: '',
      title: 'Meedan',
      description: 'A team of designers, technologists and journalists who focus on open source investigation of digital media and crowdsourced translation of social media.',
      picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png',
      author_url: 'https://meedan.com',
      author_picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png',
      author_name: 'Meedan',
      raw: {},
      url: 'https://meedan.com/en/',
      provider: 'page',
      type: 'item',
      parsed_at: '2017-09-29T23:35:29.690+00:00',
      favicon: 'https://www.google.com/s2/favicons?domain_url=meedan.com/en/',
      embed_tag: '<script src="http://pender:3200/api/medias.js?url=https%3A%2F%2Fmeedan.com%2Fen%2F" type="text/javascript"></script>',
      refreshes_count: 1,
    },
  };

  const webPageWithScreenshotPicture = {
    media: {
      id: 'UHJvamVjdE1lZGlhLzI2\n',
      dbid: 26,
      quote: null,
      published: '1508470916',
      archived: CheckArchivedFlags.NONE,
      url: 'http://idlewords.com/2006/04/argentina_on_two_steaks_a_day.htm',
      last_status: 'undetermined',
      field_value: 'pending',
      log_count: 0,
      domain: 'idlewords.com',
      project: {},
      project_id: 1,
      language: null,
      language_code: null,
      media: {},
      user: {},
      last_status_obj: {},
      tags: {},
      tasks: {},
      log: {},
      team: {},
      embed_path: '',
      media: {
        metadata: {
          title: "Web Page with a Screenshot Picture",
        },
      },
    },
    data: {
      published_at: '',
      username: '',
      title: 'Argentina On Two Steaks A Day (Idle Words)',
      description: '',
      picture: 'http://pender:3200/screenshots/http-idlewords-com-2006-04-argentina_on_two_steaks_a_day-htm.png',
      author_url: 'http://idlewords.com',
      author_picture: 'http://pender:3200/screenshots/http-idlewords-com-2006-04-argentina_on_two_steaks_a_day-htm.png',
      author_name: 'Argentina On Two Steaks A Day (Idle Words)',
      raw: {},
      url: 'http://idlewords.com/2006/04/argentina_on_two_steaks_a_day.htm',
      provider: 'page',
      type: 'item',
      parsed_at: '2017-10-20T03:41:55.986+00:00',
      favicon: 'https://www.google.com/s2/favicons?domain_url=idlewords.com/2006/04/argentina_on_two_steaks_a_day.htm',
      embed_tag: '<script src="http://pender:3200/api/medias.js?url=http%3A%2F%2Fidlewords.com%2F2006%2F04%2Fargentina_on_two_steaks_a_day.htm" type="text/javascript"></script>',
      refreshes_count: 1,
    },
  };

  const webPageWithWhitelistedUrl = {
    media: {
      __dataID__: 'UHJvamVjdE1lZGlhLzEw\n',
      id: 'UHJvamVjdE1lZGlhLzEw\n',
      dbid: 10,
      quote: null,
      published: '1506728130',
      archived: CheckArchivedFlags.NONE,
      url: 'https://meedan.com/en/',
      team: {
        get_embed_whitelist: "meedan.com, checkmedia.org"
      },
      metadata: {
        published_at: "",
        username: "",
        title: "Meedan",
        description: "A team of designers, technologists and journalists who focus on open source investigation of digital media and crowdsourced translation of social media.",
        picture: "http://meedan.com/images/logos/meedan-logo-600@2x.png",
        author_url: "https://meedan.com",
        author_picture: "http://meedan.com/images/logos/meedan-logo-600@2x.png",
        author_name: "Meedan",
      },
      media: {
        metadata: {
          title: "Web Page with a Good Picture",
          url: "https://meedan.com/en/",
          html: "hello!",
        }
      }
    },
    data: {
      published_at: '',
      username: '',
      title: 'Meedan',
      description: 'A team of designers, technologists and journalists who focus on open source investigation of digital media and crowdsourced translation of social media.',
      picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png',
      author_url: 'https://meedan.com',
      author_picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png',
      author_name: 'Meedan',
      raw: {},
      url: 'https://meedan.com/en/',
      provider: 'page',
      type: 'item',
      parsed_at: '2017-09-29T23:35:29.690+00:00',
      favicon: 'https://www.google.com/s2/favicons?domain_url=meedan.com/en/',
      embed_tag: '<script src="http://pender:3200/api/medias.js?url=https%3A%2F%2Fmeedan.com%2Fen%2F" type="text/javascript"></script>',
      refreshes_count: 1,
      html: "hello!",
    },
  };

  it('renders a picture if there is a good picture', () => {
    const card = mountWithIntl(
      <WebPageMediaCard
        media={webPageWithGoodPicture.media}
        data={webPageWithGoodPicture.data}
      />,
    );

    expect(card.find('img').html()).toMatch(`src="${webPageWithGoodPicture.data.picture}"`);
  });

  it('displays the embed html only if the domain is whitelisted', () => {
    const card1 = mountWithIntl(
      <WebPageMediaCard
        media={webPageWithWhitelistedUrl.media}
        data={webPageWithWhitelistedUrl.data}
      />,
    );

    webPageWithWhitelistedUrl.media.team.get_embed_whitelist = "checkmedia.org";
    const card2 = mountWithIntl(
      <WebPageMediaCard
        media={webPageWithWhitelistedUrl.media}
        data={webPageWithWhitelistedUrl.data}
      />,
    );

    delete webPageWithWhitelistedUrl.media.team.get_embed_whitelist;
    const card3 = mountWithIntl(
      <WebPageMediaCard
        media={webPageWithWhitelistedUrl.media}
        data={webPageWithWhitelistedUrl.data}
      />,
    );

    expect(card1.text()).toMatch(webPageWithWhitelistedUrl.data.html);
    expect(card2.text()).not.toMatch(webPageWithWhitelistedUrl.data.html);
    expect(card3.text()).not.toMatch(webPageWithWhitelistedUrl.data.html);
  });

  it('renders an error message if data has error', () => {
    webPageWithGoodPicture.data.error = {
      message: 'Not Found',
      code: 14
    };

    const cardWithErrorMessage = mountWithIntl(
      <WebPageMediaCard
        media={webPageWithGoodPicture.media}
        data={webPageWithGoodPicture.data}
      />,
    );

    delete webPageWithGoodPicture.data.error;
    const cardWithoutErrorMessage = mountWithIntl(
      <WebPageMediaCard
        media={webPageWithGoodPicture.media}
        data={webPageWithGoodPicture.data}
      />,
    );

    expect(cardWithErrorMessage.find('div.web-page-media-card__error')).toHaveLength(1);
    expect(cardWithoutErrorMessage.find('div.web-page-media-card__error')).toHaveLength(0);
  });
});
