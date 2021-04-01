import 'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import getDocument from './parser.js';
import resources from './locales/index.js';
import initView from './view.js';

const axios = require('axios');

const app = () => {
  const domElements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    button: document.querySelector('button[type$=submit]'),
    feedback: document.querySelector('.feedback'),
  };

  const state = {
    form: {
      errorMessage: '',
    },
    feeds: [],
    posts: [],
    uiState: {
      openedPosts: [],
    },
    processState: 'active',
    rssLinks: [],
  };

  const watchedState = initView(state, domElements);

  i18next.init({
    lng: 'ru',
    debug: 'true',
    resources,
  });

  const schema = () => yup.string().url(i18next.t('formErrors.invalid')).notOneOf(state.rssLinks, i18next.t('formErrors.used'));

  const validate = (link) => {
    try {
      schema().validateSync(link, { abortEarly: false });
      return '';
    } catch (e) {
      return e.message;
    }
  };

  const loadContentsFromLink = (link) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(link)}`)
    .then((response) => getDocument(response.data.contents));

  const addPosts = (posts, id) => {
    [...posts].reverse().forEach((item) => {
      const postId = watchedState.posts.length + 1;
      const postTitle = item.querySelector('title').textContent;
      const postDescription = item.querySelector('description').textContent;
      const postLink = item.querySelector('link').textContent;
      const post = {
        feedId: id,
        postId,
        postTitle,
        postDescription,
        postLink,
      };
      watchedState.posts.push(post);
    });
  };
  const getDateInMs = (stringDate) => new Date(stringDate).getTime();

  const normalizeContent = (content) => {
    const feedTitle = content.querySelector('title').textContent;
    const feedDescription = content.querySelector('description').textContent;
    const lastBuildDate = content.querySelector('item').querySelector('pubDate').textContent;
    const lastUpdate = getDateInMs(lastBuildDate);
    const id = state.rssLinks.length;
    watchedState.feeds.push({
      id, lastUpdate, feedTitle, feedDescription,
    });

    const posts = content.querySelectorAll('item');
    addPosts(posts, id);
    watchedState.processState = 'loaded';
  };
  const networkErrorHandler = () => {
    const errMessage = i18next.t('network');
    watchedState.form.errorMessage = errMessage;
    watchedState.processState = 'failed';
    // throw new Error(errMessage);
  };

  const updateContent = () => {
    watchedState.rssLinks.forEach((value, index) => {
      const content = loadContentsFromLink(value);
      const { lastUpdate } = watchedState.feeds[index];
      content.then((doc) => {
        const lastPostDate = doc.querySelector('item').querySelector('pubDate').textContent;
        const lastPostDateInMs = getDateInMs(lastPostDate);
        if (lastUpdate !== lastPostDateInMs) {
          const posts = doc.querySelectorAll('item');
          watchedState.feeds[index].lastUpdate = lastPostDateInMs;
          const newPosts = [...posts].filter((post) => {
            const postDate = post.querySelector('pubDate').textContent;
            const postDateInMs = getDateInMs(postDate);
            return lastUpdate < postDateInMs;
          });
          addPosts(newPosts, index + 1);
          watchedState.processState = 'updated';
          watchedState.processState = 'active';
          setTimeout(updateContent, 5000);
        }
      })
        .catch(() => networkErrorHandler());
    });
  };

  domElements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.processState = 'processed';
    const link = domElements.input.value;
    const errorMessage = validate(link);
    if (errorMessage.length < 1) {
      const contents = loadContentsFromLink(link);
      contents
        .then((data) => {
          watchedState.rssLinks.push(link);
          normalizeContent(data);
          setTimeout(updateContent, 5000);
        })
        .catch(() => {
          networkErrorHandler();
        });
    } else {
      watchedState.form.errorMessage = errorMessage;
      watchedState.processState = 'failed';
    }
  });
};

export default app;
