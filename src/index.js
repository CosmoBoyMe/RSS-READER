import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import watch from './watchers.js';
import parseContents from './parser.js';

const app = (i18nextInstance) => {
  const TIMEOUT = 5000;

  const domElements = {
    rssForm: document.querySelector('.rss-form'),
    rssFormInput: document.querySelector('.rss-form input'),
    rssFormSubmitButton: document.querySelector('.rss-form button[type$=submit]'),
    feedback: document.querySelector('.feedback'),
    feedsContainer: document.querySelector('.feeds'),
    postsContainer: document.querySelector('.posts'),
    modalTitle: document.querySelector('#modal .modal-title'),
    modalBody: document.querySelector('#modal .modal-body'),
  };
  const initState = {
    form: {
      errorMessage: '',
      valid: 'true',
    },
    feeds: [],
    posts: [],
    uiState: {
      openedPosts: [],
    },
    loadingState: 'idle',
    errorMessage: '',
  };

  const watcher = watch(initState, domElements, i18nextInstance);

  const rssLinks = [];

  const schema = yup.string().url('formErrors.invalid').required();

  const networkErrorHandler = () => {
    watcher.errorMessage = 'network';
    watcher.loadingState = 'failed';
  };

  const validate = (link, validateSchema, usedLinks) => {
    try {
      validateSchema.notOneOf(usedLinks, 'formErrors.used').validateSync(link);
      return '';
    } catch (e) {
      return e.message;
    }
  };

  const normalizePosts = (feedId, posts) => posts
    .map((item) => {
      const post = item;
      post.feedId = feedId;
      post.id = _.uniqueId();
      return post;
    });

  const getNewPosts = (oldPosts, allPosts) => {
    const posts = [];
    allPosts.forEach((post) => {
      const samePost = oldPosts.filter((p) => p.title === post.title);
      if (_.isEmpty(samePost)) {
        posts.push(post);
      }
    });
    return posts;
  };
  const buildPathForLink = (link) => `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(link)}`;

  const updatePosts = (state) => {
    const promises = state.feeds.map((feed) => axios.get(buildPathForLink(feed.link))
      .then((response) => {
        const contents = parseContents(response.data.contents);
        const newPosts = getNewPosts(watcher.posts, contents.posts);
        const normalizeNewPosts = normalizePosts(feed.id, newPosts);
        state.posts.push(...normalizeNewPosts);
        return normalizeNewPosts;
      })
      .catch((e) => console.log(e)));
    Promise.all(promises)
      .finally(() => setTimeout(() => updatePosts(state), TIMEOUT));
  };

  const normalizeContents = (content, link) => {
    const id = _.uniqueId();
    const { title, description } = content.feed;
    const feed = {
      title, description, link, id,
    };
    const posts = normalizePosts(id, [...content.posts]);
    return { feed, posts };
  };

  domElements.rssForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const link = formData.get('url');
    const errorMessage = validate(link, schema, rssLinks);
    if (errorMessage) {
      watcher.form.errorMessage = errorMessage;
      watcher.form.valid = true;
    } else {
      watcher.form.valid = false;
      axios.get(buildPathForLink(link))
        .then((response) => {
          const contents = parseContents(response.data.contents);
          const normalizedContents = normalizeContents(contents, link);
          rssLinks.push(link);
          watcher.loadingState = 'loading';
          watcher.feeds.push(normalizedContents.feed);
          watcher.posts.push(...normalizedContents.posts);
          watcher.loadingState = 'succeeded';
        })
        .catch(() => networkErrorHandler());
    }
  });
  setTimeout(() => updatePosts(watcher), TIMEOUT);
};

export default app;
