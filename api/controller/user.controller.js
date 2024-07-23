export const test = (req, res) => {
  res.json({ message: "Hello World!" });
};



export const signout = (req, res, next) => {
  try {
    res.clearCookie("access_token").status(200).json("User has been Sign Out");
  } catch (error) {
    next(error);
  }
};
