const request = require("supertest");

const app = require("../app");
const db = require("../db");
const Book = require("../models/book.js");

describe("Book Routes Test", function () {
  beforeEach(async function () {
    await db.query("DELETE FROM books");

    let book1 = Book.create({
      isbn: "0691161518",
      amazon_url: "http://a.co/eobPtX2",
      author: "Matthew Lane",
      language: "english",
      pages: 264,
      publisher: "Princeton University Press",
      title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      year: 2017,
    });
  });

  /** GET / - all books */

  describe("GET /", function () {
    test("get list of all books", async function () {
      const response = await request(app).get("/books/");
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        books: [
          {
            isbn: "0691161518",
            amazon_url: "http://a.co/eobPtX2",
            author: "Matthew Lane",
            language: "english",
            pages: 264,
            publisher: "Princeton University Press",
            title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
            year: 2017,
          },
        ],
      });
    });
  });

  /** GET /[isbn] */

  describe("GET /:isbn", function () {
    test("get single book by isbn", async function () {
      const response = await request(app).get("/books/0691161518");
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        book: {
          isbn: "0691161518",
          amazon_url: "http://a.co/eobPtX2",
          author: "Matthew Lane",
          language: "english",
          pages: 264,
          publisher: "Princeton University Press",
          title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
          year: 2017,
        },
      });
    });
    test("get 404 if isbn invalid", async function () {
      const response = await request(app).get("/books/0691161");
      expect(response.statusCode).toEqual(404);
      expect(response.error.text).toContain(
        "There is no book with an isbn '0691161"
      );
    });
  });

  /** POST / */

  describe("POST /", function () {
    test("post new book", async function () {
      const newBook = {
        isbn: "0691161519",
        amazon_url: "http://a.co/eobPtX4",
        author: "Joe Schmoe",
        language: "english",
        pages: 25,
        publisher: "Noton University Press",
        title: "Power-Down: Unlocking Nothing New",
        year: 2020,
      };
      const response = await request(app).post("/books/").send(newBook);
      expect(response.statusCode).toEqual(201);
      expect(response.body).toEqual({
        book: {
          isbn: "0691161519",
          amazon_url: "http://a.co/eobPtX4",
          author: "Joe Schmoe",
          language: "english",
          pages: 25,
          publisher: "Noton University Press",
          title: "Power-Down: Unlocking Nothing New",
          year: 2020,
        },
      });
    });
    test("get 400 if missing field (author)", async function () {
      const newBook = {
        isbn: "0691161519",
        amazon_url: "http://a.co/eobPtX4",
        language: "english",
        pages: 25,
        publisher: "Noton University Press",
        title: "Power-Down: Unlocking Nothing New",
        year: 2020,
      };
      const response = await request(app).post("/books/").send(newBook);
      expect(response.statusCode).toEqual(400);
      expect(response.error.text).toContain(
        `instance requires property \\"author\\"`
      );
    });
    test("get 400 if string in integer field (year)", async function () {
      const newBook = {
        isbn: "0691161519",
        amazon_url: "http://a.co/eobPtX4",
        author: "Joe Schmoe",
        language: "english",
        pages: 25,
        publisher: "Noton University Press",
        title: "Power-Down: Unlocking Nothing New",
        year: "twenty twenty",
      };
      const response = await request(app).post("/books/").send(newBook);
      expect(response.statusCode).toEqual(400);
      expect(response.error.text).toContain(
        `instance.year is not of a type(s) integer`
      );
    });
    test("get 400 if number in string field (publisher)", async function () {
      const newBook = {
        isbn: "0691161519",
        amazon_url: "http://a.co/eobPtX4",
        author: "Joe Schmoe",
        language: "english",
        pages: 25,
        publisher: 1234,
        title: "Power-Down: Unlocking Nothing New",
        year: 2020,
      };
      const response = await request(app).post("/books/").send(newBook);
      expect(response.statusCode).toEqual(400);
      expect(response.error.text).toContain(
        `instance.publisher is not of a type(s) string`
      );
    });
  });

  /** PUT /[isbn]   bookData => {book: updatedBook}  */

  describe("PUT /:isbn", function () {
    test("update existing book", async function () {
      const updatedBook = {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Brane",
        language: "english",
        pages: 264,
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017,
      };
      const response = await request(app)
        .put("/books/0691161518")
        .send(updatedBook);
      expect(response.statusCode).toEqual(200);
      expect(response.body).toEqual({
        book: {
          isbn: "0691161518",
          amazon_url: "http://a.co/eobPtX2",
          author: "Matthew Brane",
          language: "english",
          pages: 264,
          publisher: "Princeton University Press",
          title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
          year: 2017,
        },
      });
    });
    test("get 400 with invalide data type (pages)", async function () {
      const updatedBook = {
        isbn: "0691161518",
        amazon_url: "http://a.co/eobPtX2",
        author: "Matthew Lane",
        language: "english",
        pages: "many",
        publisher: "Princeton University Press",
        title: "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        year: 2017,
      };
      const response = await request(app)
        .put("/books/0691161518")
        .send(updatedBook);
      expect(response.statusCode).toEqual(400);
      expect(response.error.text).toContain(
        `instance.pages is not of a type(s) integer`
      );
    });
  });
  describe("DELETE /:isbn", function () {
    test("delete book", async function () {
      const response = await request(app).delete("/books/0691161518");
      expect(response.statusCode).toEqual(200);
      expect(response.body.message).toEqual("Book deleted");
    });
    test("get 404 with invalid isbn", async function () {
      const response = await request(app).delete("/books/0691161");
      expect(response.statusCode).toEqual(404);
      expect(response.error.text).toContain(
        "There is no book with an isbn '0691161"
      );
    });
  });
});

afterAll(async function () {
  await db.end();
});
