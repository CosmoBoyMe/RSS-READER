const validate = (link, schema) => {
  try {
    schema().validateSync(link, { abortEarly: false });
    return '';
  } catch (e) {
    return e.message;
  }
};
export default validate;
