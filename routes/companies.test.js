process.env.NODE_ENV = "test";

const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testCompany;
beforeEach(async function() {
    let result = await db.query(
        `INSERT INTO companies (code, name, description) 
        VALUES ('tcn', 'testCompanyName', 'companyDescription') 
        RETURNING code, name, description`
    )
    testCompany = result.rows[0];
})

afterEach(async function() {
    await db.query("DELETE FROM companies");
})

afterAll(async function() {
    await db.end();
})

describe("GET /companies", function () {
    test("Get a list of 1 company", async function() {
        const res = await request(app).get(`/companies`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({company: [testCompany]});
    });
});

describe("GET /companies/:id", function () {
    test("Get a single company", async function() {
        const res = await request(app).get(`/companies/${testCompany.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({company: [testCompany]});
    });
    test("Respond with 404 if cannot find company", async function() {
        const res = await request(app).get(`/companies/0`);
        expect(res.statusCode).toEqual(404);
    });
});

describe("POST /companies", function () {
    test("Create a new company", async function() { 
        const res = await request(app)
            .post(`/companies`)
            .send({code: 'ot', name: 'otherTest', description: 'otherDescription'});
        expect(res.statusCode).toEqual(201);
        expect(res.body).toEqual({company: {id: expect.any(Number), code: 'ot', name: 'otherTest', description: 'otherDescription'}});
    });
});

describe("PATCH /companies/:code", function() {
    test("Update a company", async function() {
        const res = await request(app)
            .patch(`/companies/${testCompany.id}`)
            .send({code: 'nt', name: 'newTest', description: 'patchDescription'});
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({company: {id: testCompany.id, code: 'nt', name: 'newTest', description: 'patchDescription'}});
    });

    test("Respond with 404 if cannot find company", async function() {
        const res = await request(app).patch(`/companies/0`);
        expect(res.statusCode).toEqual(404);
    });
});

describe("DELETE /companies/:code", function() {
    test("Delete a single company", async function() {
        const res = await request(app).delete(`/companies/${testCompany.id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual({status: "Deleted"});
    });
});