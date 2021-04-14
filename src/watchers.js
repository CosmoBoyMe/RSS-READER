import onChange from 'on-change';
// import _ from 'lodash';

const watcher = (state, domElements, i18nextInstance) => {
  const {
    rssFormInput,
    rssFormSubmitButton,
    feedback,
    feedsContainer,
    postsContainer,
    modalTitle,
    modalBody,
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

  const renderFormAfterLoad = () => {
    rssFormInput.value = '';
    rssFormInput.focus();
    rssFormInput.classList.remove('is-invalid');
    feedback.classList.add('text-success');
    feedback.classList.remove('text-danger');
    feedback.textContent = i18nextInstance.t('feedback');
    rssFormSubmitButton.removeAttribute('disabled');
    rssFormInput.removeAttribute('readonly');
  };

  const formValidateHandler = (value) => {
    if (!value) {
      rssFormSubmitButton.setAttribute('disabled', true);
      rssFormInput.setAttribute('readonly', true);
    } else {
      rssFormSubmitButton.removeAttribute('disabled');
      rssFormInput.removeAttribute('readonly');
    }
  };
  const renderFeeds = (feeds) => {
    feedsContainer.innerHTML = '';
    const feedsList = document.createElement('ul');
    feedsList.classList.add('list-group', 'mb-5');
    const feedsTitle = document.createElement('h2');
    feedsTitle.textContent = i18nextInstance.t('feeds');
    feedsContainer.append(feedsTitle, feedsList);
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
  };

  const createModalButton = (postId, title, description, link, openedPosts) => {
    const modalButton = document.createElement('button');
    modalButton.classList.add('btn', 'btn-primary');
    modalButton.textContent = i18nextInstance.t('button');
    modalButton.setAttribute('type', 'button');
    modalButton.setAttribute('data-id', postId);
    modalButton.setAttribute('data-toggle', 'modal');
    modalButton.setAttribute('data-target', '#modal');
    modalButton.addEventListener('click', (event) => {
      const openedLinkBtn = document.querySelector('.full-article');
      console.log(modalTitle);
      openedLinkBtn.href = link;
      modalTitle.textContent = title;
      modalBody.textContent = description;
      openedPosts.push({ id: postId });
      const postLinkElement = event.target.previousElementSibling;
      postLinkElement.classList.remove('font-weight-bold');
      postLinkElement.classList.add('font-weight-normal');
    });

    return modalButton;
  };

  const isLinkOpened = (postId, openedPosts) => !!openedPosts.find((item) => postId === item.id);
  const createLink = (id, title, link, openedPosts) => {
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', link);
    linkElement.setAttribute('target', 'blank');
    linkElement.textContent = title;
    if (isLinkOpened(id, openedPosts)) {
      linkElement.classList.remove('font-weight-bold');
      linkElement.classList.add('font-weight-normal');
    } else {
      linkElement.classList.add('font-weight-bold');
    }
    return linkElement;
  };

  const renderPosts = (posts, uiState) => {
    postsContainer.innerHTML = '';
    const h2 = document.createElement('h2');
    h2.textContent = i18nextInstance.t('posts');
    const ul = document.createElement('ul');
    ul.classList.add('list-group');
    const { openedPosts } = uiState;
    posts.forEach((post) => {
      const {
        id, title, description, link,
      } = post;
      const li = document.createElement('li');
      li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');

      const a = createLink(id, title, link, openedPosts);
      const modalButton = createModalButton(id, title, description, link, openedPosts,
        i18nextInstance);
      li.append(a, modalButton);
      ul.prepend(li);
    });
    postsContainer.append(h2, ul);
  };

  const processStateHandler = (processState) => {
    switch (processState) {
      case 'loading': {
        rssFormSubmitButton.setAttribute('disabled', true);
        rssFormInput.setAttribute('readonly', true);
        break;
      }
      case 'succeeded': {
        renderFormAfterLoad();
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
    if (path === 'loadingState') {
      processStateHandler(value);
    } if (path === 'form.valid') {
      formValidateHandler(value);
    } if (path === 'posts') {
      renderPosts(value, watch.uiState);
    } if (path === 'feeds') {
      renderFeeds(value);
    } if (path === 'errorMessage') {
      renderError(value);
    } if (path === 'form.errorMessage') {
      renderError(value);
    }
  });
  return watch;
};

export default watcher;
