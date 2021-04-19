import 'bootstrap';
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import watch from './watchers.js';
import parseContent from './parser.js';

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
      valid: null,
    },
    feeds: [],
    posts: [],
    uiState: {
      openedPosts: new Set(),
    },
    loadingState: 'idle',
    errorMessage: '',
  };

  const watcher = watch(initState, domElements, i18nextInstance);

  const schema = yup.string().url('formErrors.invalid').required();

  const validate = (link, validateSchema, usedLinks) => {
    try {
      validateSchema.notOneOf(usedLinks, 'formErrors.used').validateSync(link);
      return '';
    } catch (e) {
      return e.message;
    }
  };

  const normalizePosts = (feedId, posts) => posts
    .map((item) => ({
      ...item, feedId, id: _.uniqueId(),
    }));

  const buildPathForLink = (link) => `https://hexlet-allorigins.herokuapp.com/get?disableCache=true&url=${encodeURIComponent(link)}`;

  const updatePosts = (state) => {
    const promises = state.feeds.map((feed) => axios.get(buildPathForLink(feed.link))
      .then((response) => {
        const contents = parseContent(response.data.contents);
        const oldPosts = state.posts.filter((post) => post.feedId === feed.id);
        const newPosts = _.differenceWith(contents.posts, oldPosts, (a, b) => a.title === b.title);
        const normalizeNewPosts = normalizePosts(feed.id, newPosts);
        state.posts.push(...normalizeNewPosts);
        return normalizeNewPosts;
      })
      .catch((e) => {
        console.log(e);
      }));
    Promise.all(promises)
      .finally(() => setTimeout(() => updatePosts(state), TIMEOUT));
  };

  const normalizeContent = (content, link) => {
    const id = _.uniqueId();
    const { title, description } = content.feed;
    const feed = {
      title, description, link, id,
    };
    const posts = normalizePosts(id, content.posts);
    return { feed, posts };
  };

  domElements.rssForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const currentLink = formData.get('url');
    const usedLinks = watcher.feeds.map(({ link }) => link);

    const errorMessage = validate(currentLink, schema, usedLinks);
    if (errorMessage) {
      watcher.form.errorMessage = errorMessage;
      watcher.form.valid = false;
    } else {
      watcher.form.valid = true;
      watcher.loadingState = 'loading';
      axios.get(buildPathForLink(currentLink))
        .then((response) => {
          const content = parseContent(response.data.contents);
          const normalizedContent = normalizeContent(content, currentLink);
          watcher.feeds.push(normalizedContent.feed);
          watcher.posts.push(...normalizedContent.posts);
          watcher.loadingState = 'succeeded';
          watcher.loadingState = 'idle';
        })
        .catch((error) => {
          if (error.isAxiosError) {
            watcher.errorMessage = 'networkError';
          } if (error.isParsingError) {
            watcher.errorMessage = error.message;
          } else {
            watcher.errorMessage = 'unexpectedError';
            throw new Error(error.message);
          }
          watcher.loadingState = 'failed';
        });
    }
  });

  domElements.postsContainer.addEventListener('click', (event) => {
    const { target } = event;

    if (target.tagName !== 'BUTTON') {
      return;
    }

    const { id } = target.dataset;
    const currentPost = watcher.posts.filter((post) => post.id === id);
    const { title, description, link } = currentPost[0];
    const modalOpenedFullLinkBtn = document.querySelector('.full-article');
    modalOpenedFullLinkBtn.href = link;
    domElements.modalTitle.textContent = title;
    domElements.modalBody.textContent = description;
    watcher.uiState.openedPosts.add(id);
    const postLinkElement = target.previousElementSibling;
    postLinkElement.classList.remove('font-weight-bold');
    postLinkElement.classList.add('font-weight-normal');
  });

  setTimeout(() => updatePosts(watcher), TIMEOUT);
};

export default app;
