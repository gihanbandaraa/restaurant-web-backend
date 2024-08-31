import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../api/index";
import Reservation from "../api/models/reservations.model.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  await Reservation.create([
    {
      name: "Gihan Bandara",
      email: "gihanbandara999@gmail.com",
      phone: "123-456-7890",
      date: new Date("2024-09-01"),
      time: "19:00",
      people: 4,
      branch: "Main Branch",
      status: "pending",
    },
    {
      name: "Gihan Pasindu",
      email: "gihanbandara999@gmail.com",
      phone: "098-765-4321",
      date: new Date("2024-09-01"),
      time: "20:00",
      people: 2,
      branch: "Main Branch",
      status: "pending",
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Reservations API", () => {
  let reservationId;

  beforeEach(async () => {
    const reservation = await Reservation.findOne();
    reservationId = reservation._id;
  });

  test("GET /api/admin/get-reservations - should retrieve all reservations", async () => {
    const response = await request(app).get("/api/admin/get-reservations");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);

    const reservationDates = response.body.map((res) => res.date);
    expect(reservationDates).toContain("2024-09-01");
  });

  test("PUT /api/admin/confirm-reservation/:id - should confirm a reservation and send an email", async () => {
    const response = await request(app)
      .put(`/api/admin/confirm-reservation/${reservationId}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Reservation confirmed successfully!");

    const reservation = await Reservation.findById(reservationId);
    expect(reservation.status).toBe("confirmed");
  }, 15000); // Increase timeout to 15 seconds

  test("PUT /api/admin/reject-reservation/:id - should reject a reservation and send an email", async () => {
    const response = await request(app)
      .put(`/api/admin/reject-reservation/${reservationId}`)
      .send();

    expect(response.status).toBe(200);
    expect(response.body.message).toBe(
      "Reservation rejected successfully and email sent!"
    );

    const reservation = await Reservation.findById(reservationId);
    expect(reservation.status).toBe("rejected");
  }, 15000); // Increase timeout to 15 seconds
});
