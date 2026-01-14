const success = (message, data) => {
  return {
    message: message,
    data: data,
  };
};

//return user without password
const cleanUser = (user) => {
  const { password, ...cleanUser } = user.get({ plain: true });
  return cleanUser;
}

export { success, cleanUser };