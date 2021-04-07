import 'bootstrap';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import _, { update } from 'lodash';
import parseContents from './parser.js';
import resources from './locales/index.js';
import initView from './view.js';
import validate from './validate.js';

const app = () => {
  const domElements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('.rss-form input'),
    button: document.querySelector('.rss-form button[type$=submit]'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
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
    processState: 'idle',
  };

  const watchedState = initView(state, domElements);

  i18next.init({
    lng: 'ru',
    debug: 'true',
    resources,
  });

  const rssLinks = [];

  const schema = () => yup.string().url(i18next.t('formErrors.invalid')).notOneOf(rssLinks, i18next.t('formErrors.used'));

  const getRequest = (link) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(link)}`);

  const networkErrorHandler = () => {
    const errMessage = i18next.t('network');
    watchedState.form.errorMessage = errMessage;
    watchedState.processState = 'failed';
    throw new Error(errMessage);
  };

  const normalizePosts = (feedId, posts) => posts
    .map((item) => {
      const post = item;
      post.feedId = feedId;
      post.id = _.uniqueId();
      return post;
    });

  const normalizeContents = (content, link) => {
    const id = _.uniqueId();
    const { title, description } = content.feed;
    const feed = {
      title, description, link, id,
    };
    const posts = normalizePosts(id, [...content.posts]);
    return { feed, posts };
  };

  const getNewPosts = (oldPosts, allPosts) => {
    const posts = [];
    allPosts.forEach((post) => {
      const isNewPost = !oldPosts.find((p) => p.title === post.title);
      if (isNewPost) {
        posts.push(post);
      }
    });
    return posts;
  };

  const updatePosts = (feeds, oldPosts) => {
    console.log(feeds);
    console.log(oldPosts);
    const promises = feeds.map((feed) => getRequest(feed.link)
      .then((response) => {
        const contents = parseContents(response.data.contents);
        const newPosts = getNewPosts(oldPosts, contents.posts);
        if (newPosts.length < 1) {
          return [];
        }
        const normalizeNewPosts = normalizePosts(feed.id, newPosts);
        return normalizeNewPosts;
      }));
    Promise.all(promises)
      .then((values) => {
        watchedState.posts.push(...values.flat());
        watchedState.processState = 'updated';
        watchedState.processState = 'idle';
      })
      .catch((e) => console.log(e))
      .finally(() => setInterval(() => updatePosts(state.feeds, state.posts), 5000));
  };

  domElements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    watchedState.processState = 'processed';
    const formData = new FormData(event.target);
    const link = formData.get('url');
    const errorMessage = validate(link, schema);

    if (errorMessage) {
      watchedState.form.errorMessage = errorMessage;
      watchedState.processState = 'failed';
    } else {
      watchedState.processState = 'loading';
      getRequest(link)
        .then((response) => {
          const contents = parseContents(response.data.contents);
          const normalizedContents = normalizeContents(contents, link);
          rssLinks.push(link);
          watchedState.feeds.push(normalizedContents.feed);
          watchedState.posts.push(...normalizedContents.posts);
          watchedState.processState = 'succeeded';
          setTimeout(() => updatePosts(state.feeds, state.posts), 5000);
        })
        .catch(() => networkErrorHandler());
    }
  });
};

export default app;
