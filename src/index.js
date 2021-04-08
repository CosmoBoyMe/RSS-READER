import 'bootstrap';
import * as yup from 'yup';
import watch from './watchers.js';

import updatePosts from './updatePost.js';
import normalizeContents from './utilits.js/normalizeContents';
import parseContents from './utilits.js/parser.js';
import validate from './utilits.js/validate.js';
import getRequest from './utilits.js/getRequest.js';

const app = (i18nextInstance) => {
  console.log(i18nextInstance);
  const domElements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    button: document.querySelector('.rss-form button[type$=submit]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };

  const initState = {
    form: {
      errorMessage: '',
    },
    feeds: [],
    posts: [],
    uiState: {
      openedPosts: [],
    },
    appProcessState: 'idle',
  };

  const watcher = watch(initState, domElements, i18nextInstance);

  const rssLinks = [];

  const schema = () => yup.string().url('formErrors.invalid').notOneOf(rssLinks, 'formErrors.used');

  const networkErrorHandler = () => {
    const errMessage = 'network';
    watcher.form.errorMessage = errMessage;
    watcher.appProcessState = 'failed';
    // throw new Error(errMessage);
  };

  domElements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    watcher.appProcessState = 'processed';
    const formData = new FormData(event.target);
    const link = formData.get('url');
    const errorMessage = validate(link, schema);
    if (errorMessage) {
      watcher.form.errorMessage = errorMessage;
      watcher.appProcessState = 'failed';
    } else {
      watcher.appProcessState = 'loading';
      getRequest(link)
        .then((response) => {
          const contents = parseContents(response.data.contents);
          const normalizedContents = normalizeContents(contents, link);
          rssLinks.push(link);
          watcher.feeds.push(normalizedContents.feed);
          watcher.posts.push(...normalizedContents.posts);
          watcher.appProcessState = 'succeeded';
        })
        .catch(() => networkErrorHandler());
    }
  });
  setTimeout(() => updatePosts(watcher), 5000);
};

export default app;
