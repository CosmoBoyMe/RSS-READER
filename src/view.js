const renderErrors = (formState) => {
  const feedbackElement = document.querySelector('.feedback');
  const input = document.querySelector('input');
  console.log(formState);
  if (formState.valid) {
    input.classList.remove('is-invalid');
    feedbackElement.classList.add('text-success');
    feedbackElement.classList.remove('text-danger');
    feedbackElement.textContent = '';
  } else {
    input.classList.add('is-invalid');
    feedbackElement.classList.add('text-danger');
    feedbackElement.classList.remove('text-success');
    feedbackElement.textContent = formState.errorMessage;
  }
};

const renderFeed = ({ id, feedTitle, feedDescription }) => {
  const container = document.querySelector('.feeds');
  if (id === 1) {
    const h2 = document.createElement('h2');
    const ul = document.createElement('ul');
    ul.classList.add('list-group', 'mb-5');
    h2.textContent = 'Фиды';
    container.append(h2, ul);
  }
  const ul = document.querySelector('.feeds>ul');
  const li = document.createElement('li');
  li.classList.add('list-group-item');
  const h3 = document.createElement('h3');
  const p = document.createElement('p');
  h3.textContent = feedTitle;
  p.textContent = feedDescription;
  li.append(h3, p);
  ul.prepend(li);
};

const renderPosts = (posts) => {
  const container = document.querySelector('.posts');
  container.innerHTML = '';
  const reversedPosts = posts;
  const h2 = document.createElement('h2');
  const ul = document.createElement('ul');
  ul.classList.add('list-group');
  h2.textContent = 'Посты';
  reversedPosts.forEach((post) => {
    const { postTitle, postlink } = post;
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start');
    const a = document.createElement('a');
    a.setAttribute('href', postlink);
    a.textContent = postTitle;
    li.append(a);
    ul.prepend(li);
  });
  container.append(h2, ul);
};
export { renderErrors, renderFeed, renderPosts };
