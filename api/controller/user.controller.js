import Reservation from "../models/reservations.model.js";

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

export const makeReservation = async (req, res, next) => {
  const { name, email, phone, date, time, people, message,branch } = req.body;

  if (!name || !email || !phone || !date || !time || !people || !branch) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }

  try {
    const reservation = await Reservation.create({
      name,
      email,
      phone,
      date,
      time,
      people,
      message,
      branch,
    });

    return res.status(201).json({
      success: true,
      message:
        "Reservation has been made Successfully Confirmations will be sent to your email",
    });
  } catch (error) {
    next(error);
  }
};

export const addQuery = async (req, res, next) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res
      .status(400)
      .json({ success: false, message: "All fields are required" });
  }
  try {
    const query = await Query.create({ name, email, message });
    return res
      .status(201)
      .json({ success: true, message: "Query Added Successfully" });
  } catch (error) {
    next(error);
  }
};
