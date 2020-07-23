/* global describe, expect, it */
import React from 'react';
import { mountWithIntlProvider } from '../../../../test/unit/helpers/intl-test';
import { MediaTitle } from './MediaTitle';

const Example = {
  media: {
    embed_path: null,
    metadata: {},
    quote: null,
  },
  domain: null,
  metadata: {},
  overridden: {},
  quote: null,
};

describe('MediaTypeDisplayName', () => {
  describe('in English', () => {
    function text(projectMedia) {
      const node = mountWithIntlProvider(<MediaTitle projectMedia={projectMedia} />);
      return node.text();
    }

    it('should show a Twitter title', () => {
      expect(text({
        ...Example,
        domain: 'twitter.com',
        media: {
          ...Example.media,
          metadata: { title: 'My Tweet Title' },
        },
      })).toEqual('My Tweet Title');
    });

    it('should show "Tweet by Author', () => {
      expect(text({
        ...Example,
        domain: 'twitter.com',
        metadata: {
          // TODO describe how this can ever happen
          title: '',
          author_name: 'Adam Hooper',
        },
      })).toEqual('Tweet by Adam Hooper');
    });

    it('should show a Facebook post title', () => {
      expect(text({
        ...Example,
        domain: 'facebook.com',
        media: {
          ...Example.media,
          metadata: { title: 'My Facebook-post Title' },
        },
      })).toEqual('My Facebook-post Title');
    });

    it('should show "Facebook post by Author"', () => {
      expect(text({
        ...Example,
        domain: 'facebook.com',
        metadata: {
          // TODO describe how this can ever happen
          title: '',
          author_name: 'Adam Hooper',
        },
      })).toEqual('Facebook post by Adam Hooper');
    });

    it('should show "Instagram by Author"', () => {
      expect(text({
        ...Example,
        domain: 'instagram.com',
        metadata: {
          // TODO describe how this can ever happen
          title: '',
          author_name: 'Adam Hooper',
        },
      })).toEqual('Instagram by Adam Hooper');
    });

    it('should show "YouTube video by Author"', () => {
      expect(text({
        ...Example,
        domain: 'youtube.com',
        metadata: {
          // TODO describe how this can ever happen
          title: '',
          author_name: 'Adam Hooper',
        },
      })).toEqual('YouTube video by Adam Hooper');
    });

    it('should show "TikTok video by Author"', () => {
      expect(text({
        ...Example,
        domain: 'tiktok.com',
        metadata: {
          // TODO describe how this can ever happen
          title: '',
          author_name: 'Adam Hooper',
        },
      })).toEqual('TikTok video by Adam Hooper');
    });

    it('should show Claim title', () => {
      expect(text({
        ...Example,
        media: {
          ...Example.media,
          quote: 'A promise made is a debt unpaid',
        },
      })).toEqual('A promise made is a debt unpaid');
    });

    it('should show Image title', () => {
      expect(text({
        ...Example,
        media: {
          ...Example.media,
          embed_path: 'https://url.to/file.png',
        },
        metadata: { title: 'Screenshot.png' }, // TODO explain why not media.metadata?
      })).toEqual('Screenshot.png');
    });

    it('should show Page title', () => {
      expect(text({
        ...Example,
        domain: 'example.com',
        media: {
          ...Example.media,
          metadata: {
            title: 'Example Domain',
          },
        },
      })).toEqual('Example Domain');
    });

    it('should show "Page on example.com"', () => {
      expect(text({
        ...Example,
        domain: 'example.com',
        media: {
          ...Example.media,
          metadata: {
            title: null,
          },
        },
      })).toEqual('Page on example.com');
    });

    it('should show overridden title', () => {
      // TODO explain what this is
      expect(text({
        ...Example,
        domain: 'twitter.com',
        media: {
          ...Example.media,
          metadata: { title: 'Tweet title' },
        },
        metadata: { title: 'Custom title' },
        overridden: { title: true },
      })).toEqual('Custom title');
    });

    it('should show custom title', () => {
      // TODO explain what this is.
      // [adamhooper, 2020-07-07] I wrote this test and I don't understand the behavior
      expect(text({
        ...Example,
        domain: 'twitter.com',
        media: {
          ...Example.media,
          metadata: { title: 'Tweet title' },
        },
        quote: 'Custom quote',
        metadata: { title: 'Custom title' },
      })).toEqual('Custom title');
    });

    it('should use `children` as render prop', () => {
      // <MediaTitle> runs intl code. When callers pass `children` as a render prop,
      // they can ignore intl.
      const projectMedia = {
        ...Example,
        domain: 'twitter.com',
        media: {
          ...Example.media,
          metadata: { title: 'My Tweet Title' },
        },
      };
      const node = mountWithIntlProvider((
        <MediaTitle projectMedia={projectMedia}>
          {s => s.toUpperCase()}
        </MediaTitle>
      ));
      expect(node.html()).toEqual('MY TWEET TITLE');
    });
  });
});
