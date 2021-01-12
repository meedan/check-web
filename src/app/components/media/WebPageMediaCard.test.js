import React from 'react';
import { mountWithIntl } from '../../../../test/unit/helpers/intl-test';
import WebPageMediaCard from './WebPageMediaCard.js';
import CheckArchivedFlags from '../../CheckArchivedFlags';

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
      picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png',
      metadata: {
        published_at: '',
        username: '',
        title: 'Meedan',
        description: 'A team of designers, technologists and journalists who focus on open source investigation of digital media and crowdsourced translation of social media.',
        picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png',
        author_url: 'https://meedan.com',
        author_picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png',
        author_name: 'Meedan',
      },
      media: {
        metadata: {
          title: 'Web Page with a Good Picture',
        },
      },
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
        get_embed_whitelist: 'meedan.com, checkmedia.org',
      },
      metadata: {
        published_at: '',
        username: '',
        title: 'Meedan',
        description: 'A team of designers, technologists and journalists who focus on open source investigation of digital media and crowdsourced translation of social media.',
        picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png',
        author_url: 'https://meedan.com',
        author_picture: 'http://meedan.com/images/logos/meedan-logo-600@2x.png',
        author_name: 'Meedan',
      },
      media: {
        metadata: {
          title: 'Web Page with a Good Picture',
          url: 'https://meedan.com/en/',
          html: 'hello!',
        },
      },
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
      html: 'hello!',
    },
  };

  it('renders a picture if there is a good picture', () => {
    const card = mountWithIntl(<WebPageMediaCard
      media={webPageWithGoodPicture.media}
      data={webPageWithGoodPicture.data}
    />);

    expect(card.find('img').html()).toMatch(`src="${webPageWithGoodPicture.data.picture}"`);
  });

  it('displays the embed html only if the domain is whitelisted', () => {
    const card1 = mountWithIntl(<WebPageMediaCard
      media={webPageWithWhitelistedUrl.media}
      data={webPageWithWhitelistedUrl.data}
    />);

    webPageWithWhitelistedUrl.media.team.get_embed_whitelist = 'checkmedia.org';
    const card2 = mountWithIntl(<WebPageMediaCard
      media={webPageWithWhitelistedUrl.media}
      data={webPageWithWhitelistedUrl.data}
    />);

    delete webPageWithWhitelistedUrl.media.team.get_embed_whitelist;
    const card3 = mountWithIntl(<WebPageMediaCard
      media={webPageWithWhitelistedUrl.media}
      data={webPageWithWhitelistedUrl.data}
    />);

    expect(card1.text()).toMatch(webPageWithWhitelistedUrl.data.html);
    expect(card2.text()).not.toMatch(webPageWithWhitelistedUrl.data.html);
    expect(card3.text()).not.toMatch(webPageWithWhitelistedUrl.data.html);
  });

  it('renders an error message if data has error', () => {
    webPageWithGoodPicture.data.error = {
      message: 'Not Found',
      code: 14,
    };

    const cardWithErrorMessage = mountWithIntl(<WebPageMediaCard
      media={webPageWithGoodPicture.media}
      data={webPageWithGoodPicture.data}
    />);

    delete webPageWithGoodPicture.data.error;
    const cardWithoutErrorMessage = mountWithIntl(<WebPageMediaCard
      media={webPageWithGoodPicture.media}
      data={webPageWithGoodPicture.data}
    />);

    expect(cardWithErrorMessage.find('div.web-page-media-card__error')).toHaveLength(1);
    expect(cardWithoutErrorMessage.find('div.web-page-media-card__error')).toHaveLength(0);
  });
});
