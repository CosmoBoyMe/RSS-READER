import * as _ from 'lodash';
import onChange from 'on-change';
import {
  renderError, renderFeed, renderPosts, renderHeaderAfterLoad,
} from './renders.js';

const processStateHandler = (processState, state, domElements, i18nextInstance) => {
  switch (processState) {
    case 'loading':
      domElements.button.setAttribute('disabled', true);
      domElements.input.setAttribute('readonly', true);
      break;
    case 'succeeded': {
      renderFeed(_.last(state.feeds), domElements);
      renderPosts(state.posts, state.uiState, domElements, i18nextInstance);
      renderHeaderAfterLoad(domElements, i18nextInstance);
      break;
    }
    case 'failed': {
      renderError(state.form.errorMessage, i18nextInstance);
      domElements.button.removeAttribute('disabled');
      domElements.input.removeAttribute('readonly');
      break;
    }
    case 'updated':
      renderPosts(state.posts, state.uiState, domElements, i18nextInstance);
      break;
    default:
      break;
  }
};

const watcher = (state, domElements, i18nextInstance) => {
  const watch = onChange(state, (path, value) => {
    if (path === 'appProcessState') {
      processStateHandler(value, state, domElements, i18nextInstance);
    }
  });
  return watch;
};
export default watcher;
