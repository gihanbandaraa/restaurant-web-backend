import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../api/index";
import Query from "../api/models/queries.model.js";

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  await Query.create([
    {
      name: "Gihan Bandara",
      email: "gihanbandara999@gmail.com",
      message: "Can you provide more details about your vegetarian options?",
      status: "pending",
    },
    {
      name: "Jane Smith",
      email: "gihanbandara999@gmail.com",
      message: "I would like to book a table for 4 on Saturday.",
      status: "pending",
    },
  ]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("Queries API", () => {
  let queryId;

  beforeEach(async () => {
    const query = await Query.findOne();
    queryId = query._id;
  });

  test("GET /api/admin/get-queries - should retrieve all queries", async () => {
    const response = await request(app).get("/api/admin/get-queries");

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
    const queryMessages = response.body.map((query) => query.message);
    expect(queryMessages).toContain(
      "Can you provide more details about your vegetarian options?"
    );
    expect(queryMessages).toContain(
      "I would like to book a table for 4 on Saturday."
    );
  }, 15000);

  test("DELETE /api/admin/delete-query/:id - should delete an existing query", async () => {
    const response = await request(app).delete(
      `/api/admin/delete-query/${queryId}`
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Query Deleted");

    const query = await Query.findById(queryId);
    expect(query).toBeNull();
  });

  test("PUT /api/admin/reply-query/:id - should update an existing query and send a reply email", async () => {
    const response = await request(app)
      .put(`/api/admin/reply-query/${queryId}`)
      .send({
        message:
          "We offer a variety of vegetarian options including salads, soups, and curries.",
        receiverEmail: "gihanbandara999@gmail.com",
        status: "replied",
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.status.status).toBe("replied");

    const query = await Query.findById(queryId);
    expect(query.status).toBe("replied");
  }, 15000);
});
