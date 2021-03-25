import 'bootstrap/dist/css/bootstrap.min.css';
import * as yup from 'yup';
import * as _ from 'lodash';
import getDocument from './parser.js';
import { renderErrors, renderFeed, renderPosts } from './view.js';

const onChange = require('on-change');
const axios = require('axios');

const app = () => {
  const state = {
    form: {
      errorMessage: '',
      valid: null,
    },
    feeds: [],
    posts: [],
    processState: 'active',
  };

  const rssLinks = [];

  const schema = () => yup.string().url('Ссылка должна быть валидным URL').notOneOf(rssLinks, 'RSS уже существует');

  const validate = (link) => {
    try {
      schema().validateSync(link, { abortEarly: false });
      return '';
    } catch (e) {
      return e.message;
    }
  };
  const domElements = {
    form: document.querySelector('form'),
    input: document.querySelector('input'),
    button: document.querySelector('button'),
    feedback: document.querySelector('.feedback'),
  };

  const processStateHandler = (processState, appState) => {
    switch (processState) {
      case 'validate': {
        domElements.button.setAttribute('disabled', true);
        renderErrors(appState.form);
        break;
      }
      case 'filling':
        renderFeed(_.last(appState.feeds));
        renderPosts(appState.posts);
        domElements.button.removeAttribute('disabled');
        domElements.feedback.classList.remove('text-danger');
        domElements.feedback.textContent = 'RSS успешно загружен';
        break;
      case 'failing': {
        renderErrors(appState.form);
        domElements.button.removeAttribute('disabled');
        break;
      }
      case 'update':
        break;
      default:
        break;
    }
  };
  const watchedState = onChange(state, (path, value) => {
    if (path === 'processState') {
      processStateHandler(value, state);
    }
  });
  const loadContentsFromLink = (link) => axios.get(`https://hexlet-allorigins.herokuapp.com/get?url=${encodeURIComponent(link)}`)
    .then((response) => {
      if (response.status) {
        return getDocument(response.data.contents);
      }
      throw new Error('Ошибка сети');
    });

  const normalizeContent = (content) => {
    const feedTitle = content.querySelector('title').textContent;
    const feedDescription = content.querySelector('description').textContent;
    const id = rssLinks.length;
    watchedState.feeds.push({ id, feedTitle, feedDescription });
    const posts = content.querySelectorAll('item');
    [...posts].reverse().forEach((item) => {
      const postId = watchedState.posts.length + 1;
      const postTitle = item.querySelector('title').textContent;
      const postDescription = item.querySelector('description').textContent;
      const postlink = item.querySelector('link').textContent;
      const post = {
        feedId: id,
        postId,
        postTitle,
        postDescription,
        postlink,
      };
      watchedState.posts.push(post);
    });
    watchedState.processState = 'filling';
  };

  domElements.form.addEventListener('submit', (event) => {
    event.preventDefault();
    const link = domElements.input.value;
    const errorMessage = validate(link);
    if (errorMessage.length < 1) {
      rssLinks.push(link);
      watchedState.form.valid = true;
      watchedState.form.errorMessage = '';
      watchedState.processState = 'validate';
      const contents = loadContentsFromLink(link);
      contents
        .catch((e) => {
          watchedState.form.valid = false;
          watchedState.form.errorMessage = e.message;
          watchedState.processState = 'failing';
          throw new Error(e.message);
        })
        .then((data) => {
          normalizeContent(data);
        });
    } else {
      watchedState.form.valid = false;
      watchedState.form.errorMessage = errorMessage;
      watchedState.processState = 'validate';
    }
  });
};
export default app;
