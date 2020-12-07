import * as qs from 'qs';

import Avatars from '@dicebear/avatars';

import avataaars from '@dicebear/avatars-avataaars-sprites';
import bottts from '@dicebear/avatars-bottts-sprites';
import female from '@dicebear/avatars-female-sprites';
import gridy from '@dicebear/avatars-gridy-sprites';
import human from '@dicebear/avatars-human-sprites';
import identicon from '@dicebear/avatars-identicon-sprites';
import initials from '@dicebear/avatars-initials-sprites';
import jdenticon from '@dicebear/avatars-jdenticon-sprites';
import male from '@dicebear/avatars-male-sprites';

import avataaarsOptions from '../options/avataaars';
import botttsOptions from '../options/bottts';
import femaleOptions from '../options/female';
import gridyOptions from '../options/gridy';
import humanOptions from '../options/human';
import identiconOptions from '../options/identicon';
import initialsOptions from '../options/initials';
import jdenticonOptions from '../options/jdenticon';
import maleOptions from '../options/male';

const styles: Record<string, any> = {
  avataaars: [avataaars, avataaarsOptions],
  bottts: [bottts, botttsOptions],
  female: [female, femaleOptions],
  gridy: [gridy, gridyOptions],
  human: [human, humanOptions],
  identicon: [identicon, identiconOptions],
  initials: [initials, initialsOptions],
  jdenticon: [jdenticon, jdenticonOptions],
  male: [male, maleOptions],
};

type WorkerEvent = {
  request: Request;
  respondWith: (response: Response | Promise<Response>) => void;
};

addEventListener<any>('fetch', (event: WorkerEvent) => {
  event.respondWith(handler(event.request));
});

async function handler(request: Request) {
  let url = new URL(request.url);
  let route = url.pathname.match(/^\/(?:\d+\.\d+\/)?(?:api(?:\/\d+\.\d+)?|v2)\/([a-z]+)\/([^\/]*)\.svg$/);
  let parsedQueryString = qs.parse(url.search.slice(1));
  let requestOptions = JSON.parse(JSON.stringify(parsedQueryString['options'] || parsedQueryString || {}));
  let headers = new Headers();

  if (null === route) {
    return new Response('404 Not Found', {
      status: 404,
    });
  }

  let [style, options] = styles[route[1]] || [];

  if (undefined === style) {
    return new Response('404 Not Found', {
      status: 404,
    });
  }

  try {
    await options.validate(requestOptions, {
      stripUnknown: true,
    });
  } catch (e) {
    return new Response(e['errors'].join(''), {
      status: 400,
    });
  }

  let seed = decodeURIComponent(route[2]);
  let avatars = new Avatars(style);
  let svg = avatars.create(seed, options.cast(requestOptions));

  headers.append('Content-Type', 'image/svg+xml');
  headers.append('Cache-Control', `max-age=${60 * 60 * 24 * 365}`);

  return new Response(svg, {
    headers: headers,
  });
}
