import onChange from 'on-change';

const watcher = (state, domElements, i18nextInstance) => {
  const {
    rssFormInput,
    rssFormSubmitButton,
    feedback,
    feedsContainer,
    postsContainer,
    modalTitle,
    modalBody,
    modalFullArticle,
  } = domElements;

  const renderError = (errorMessage) => {
    if (!errorMessage) {
      return;
    }
    rssFormInput.classList.add('is-invalid');
    feedback.classList.add('text-danger');
    feedback.classList.remove('text-success');
    feedback.textContent = i18nextInstance.t(errorMessage);
  };

  const formValidateHandler = (value) => {
    if (value) {
      rssFormSubmitButton.setAttribute('disabled', true);
      rssFormInput.setAttribute('readonly', true);
    } else {
      rssFormSubmitButton.removeAttribute('disabled');
      rssFormInput.removeAttribute('readonly');
    }
  };

  const renderFeeds = (feeds) => {
    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'mb-5');
    const feedsTitle = document.createElement('h2');
    feedsTitle.textContent = i18nextInstance.t('feeds');
    feeds.forEach(({ title, description }) => {
      const li = document.createElement('li');
      const h3 = document.createElement('h3');
      const p = document.createElement('p');
      li.classList.add('list-group-item');
      h3.textContent = title;
      p.textContent = description;
      li.append(h3, p);
      feedsList.prepend(li);
    });
    feedsContainer.innerHTML = '';
    feedsContainer.append(feedsTitle, feedsList);
  };

  const createModalButton = (postId) => {
    const modalButton = document.createElement('button');
    modalButton.classList.add('btn', 'btn-primary');
    modalButton.textContent = i18nextInstance.t('button');
    modalButton.setAttribute('type', 'button');
    modalButton.setAttribute('data-id', postId);
    modalButton.setAttribute('data-toggle', 'modal');
    modalButton.setAttribute('data-target', '#modal');
    return modalButton;
  };

  const renderPosts = (posts, openedPosts) => {
    const h2 = document.createElement('h2');
    h2.textContent = i18nextInstance.t('posts');
    const ul = document.createElement('ul');
    ul.classList.add('list-group');
    posts.forEach((post) => {
      const { id, title, link } = post;
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', link);
      linkElement.setAttribute('target', 'blank');

      if (openedPosts.has(id)) {
        linkElement.classList.add('font-weight-normal');
      } else {
        linkElement.classList.add('font-weight-bold');
      }
      linkElement.textContent = title;
      const modalButton = createModalButton(id);
      li.append(linkElement, modalButton);
      ul.prepend(li);
    });

    postsContainer.innerHTML = '';
    postsContainer.append(h2, ul);
  };

  const renderModal = (posts, modalId) => {
    const currentPost = posts.find((post) => post.id === modalId);
    const { title, link, description } = currentPost;
    modalFullArticle.href = link;
    modalTitle.textContent = title;
    modalBody.textContent = description;
  };

  const processStateHandler = (processState) => {
    switch (processState) {
      case 'loading': {
        rssFormSubmitButton.setAttribute('disabled', true);
        rssFormInput.setAttribute('readonly', true);
        break;
      }
      case 'idle': {
        rssFormInput.value = '';
        rssFormInput.focus();
        rssFormInput.classList.remove('is-invalid');
        feedback.classList.add('text-success');
        feedback.classList.remove('text-danger');
        feedback.textContent = i18nextInstance.t('feedback');
        rssFormSubmitButton.removeAttribute('disabled');
        rssFormInput.removeAttribute('readonly');
        break;
      }
      case 'failed': {
        rssFormSubmitButton.removeAttribute('disabled');
        rssFormInput.removeAttribute('readonly');
        break;
      }
      default:
        throw new Error(`unexpected processState ${processState}`);
    }
  };

  const watch = onChange(state, (path, value) => {
    switch (path) {
      case 'loadingState':
        processStateHandler(value);
        break;
      case 'form.valid':
        formValidateHandler(value);
        break;
      case 'posts':
        renderPosts(value, watch.uiState.openedPosts);
        break;
      case 'feeds':
        renderFeeds(value);
        break;
      case 'errorMessage':
        renderError(value);
        break;
      case 'form.errorMessage':
        renderError(value);
        break;
      case 'selectedModalId':
        renderModal(watch.posts, value);
        break;
      case 'uiState.openedPosts':
        renderPosts(watch.posts, value);
        break;
      default: {
        throw new Error(`unexpected path in State ${path}`);
      }
    }
  });
  return watch;
};

export default watcher;
