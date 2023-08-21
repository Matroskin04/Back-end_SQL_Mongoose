/*
import { describe } from 'node:test';
import { mongoURL } from '../infrastructure/db';
import { app } from '../setting';
const request = require('supertest');
import { BlogTypeWithId } from '../blogs/infrastructure/repository/blogs-types-repositories';
import mongoose from 'mongoose';
import { BlogDocument } from '../blogs/domain/blogs-schema-model';

let idOfBlog: string;
const arrayOfBlogs: Array<BlogTypeWithId | null> = [];

describe('Blogs All operation, chains: /blogs', () => {
  beforeAll(async () => {
    await mongoose.connection.close();
    await mongoose.connect(mongoURL);

    await request(app).delete('/hometask-03/testing/all-data').expect(204);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it(`+ POST -> "/blogs": should create new blog; status 201;
                GET -> /blogs/:id;`, async () => {
    const response = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send({
        name: 'Blog12-Dim',
        description: 'Some description',
        websiteUrl:
          'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
      });

    expect(response.status).toBe(201);
    expect(response.body.name).toEqual('Blog12-Dim');
    await request(app)
      .get(`/hometask-03/blogs/${response.body.id}`)
      .expect(200);

    idOfBlog = response.body.id;
  });

  it(`+ POST -> "/blogs/:blogId/posts": should create new post for specific blog; status 201;
              + POST -> /blogs, GET -> /posts/:id;`, async () => {
    const response = await request(app)
      .post(`/hometask-03/blogs/${idOfBlog}/posts`)
      .auth('admin', 'qwerty')
      .send({
        title: 'postForBlog1',
        shortDescription: 'something',
        content: 'hello',
        blogId: idOfBlog,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: expect.any(String),
      title: 'postForBlog1',
      shortDescription: 'something',
      content: 'hello',
      blogId: idOfBlog,
      blogName: 'Blog12-Dim',
      createdAt: expect.any(String),
    });
  });

  it(`- POST -> "/blogs/:blogId/posts": should NOT create new post; status 400`, async () => {
    await request(app)
      .post(`/hometask-03/blogs/${idOfBlog}/posts`)
      .auth('admin', 'qwerty')
      .send({
        title: 'Too much symbols. 123456712345671234',
        shortDescription: 'something',
        content: 'hello',
        blogId: idOfBlog,
      })
      .expect(400);
  });

  it(`- DELETE -> "/blogs/:blogId" - should delete blog;
              - POST -> "/blogs/:blogId/posts": should NOT create new post; status 404`, async () => {
    await request(app)
      .delete(`/hometask-03/blogs/${idOfBlog}`)
      .auth('admin', 'qwerty')
      .expect(204);
    await request(app)
      .post(`/hometask-03/blogs/${idOfBlog}/posts`)
      .auth('admin', 'qwerty')
      .send({
        title: 'postForBlog1',
        shortDescription: 'something',
        content: 'hello',
        blogId: idOfBlog,
      })
      .expect(404);
  });

  it(`+ POST -> "/blogs" -  should create blog;
               + PUT -> "/blogs/:id": should update blog by id; status 204;
               + GET -> /blogs/:id`, async () => {
    const responsePost = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send({
        name: 'Blog2-ITforYOU',
        description: 'some information',
        websiteUrl:
          'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
      })
      .expect(201);

    await request(app)
      .put(`/hometask-03/blogs/${responsePost.body.id}`)
      .auth('admin', 'qwerty')
      .send({
        name: 'ChangedName',
        description: 'ChangedDescription',
        websiteUrl:
          'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
      });

    const responseGet = await request(app)
      .get(`/hometask-03/blogs/${responsePost.body.id}`)
      .expect(200);

    expect(responseGet.body.name).toEqual('ChangedName');
    expect(responseGet.body.id).toEqual(responsePost.body.id);
    idOfBlog = responsePost.body.id;
  });

  it(`- PUT -> "/blogs/:id": Unauthorized; status 401`, async () => {
    await request(app)
      .put(`/hometask-03/blogs/${idOfBlog}`)
      .send({
        name: 'ChangedName',
        description: 'ChangedDescription',
        websiteUrl:
          'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
      })
      .expect(401);
  });

  it(`- PUT -> "/blogs/:id": inputModel has incorrect values; status 400`, async () => {
    await request(app)
      .put(`/hometask-03/blogs/${idOfBlog}`)
      .auth('admin', 'qwerty')
      .send({
        name: 'The name is too long: 123456123456',
        description: 'ChangedDescription',
        websiteUrl:
          'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
      })
      .expect(400);
  });
});

describe(`QUERY-PAGINATION Blogs-> "/"`, () => {
  it(`+DELETE ALL DATA,
              +POST: create 4 new blogs`, async () => {
    await request(app).delete('/hometask-03/testing/all-data').expect(204);

    //1 blog
    const blogInputData1 = {
      name: 'Alex-blog',
      description: 'Alex-description',
      websiteUrl:
        'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
    };

    const response1 = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData1);

    expect(response1.status).toBe(201);
    arrayOfBlogs.push(response1.body);

    //2 blog
    const blogInputData2 = {
      name: 'Bobi-blog',
      description: 'Bob-description',
      websiteUrl:
        'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
    };

    const response2 = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData2);

    expect(response2.status).toBe(201);
    arrayOfBlogs.push(response2.body);

    //3 blog
    const blogInputData3 = {
      name: 'Danil-blog',
      description: 'Danil-description',
      websiteUrl:
        'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
    };

    const response3 = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData3);

    expect(response3.status).toBe(201);
    arrayOfBlogs.push(response3.body);

    //4 blog
    const blogInputData4 = {
      name: 'Fiona-blog',
      description: 'Fiona-description',
      websiteUrl:
        'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
    };

    const response4 = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData4);

    expect(response4.status).toBe(201);
    arrayOfBlogs.push(response4.body);

    const allBlogs = await BlogModel.find().lean();
    expect(allBlogs.length).toBe(4);
  });

  it(`Pagination-GET: pageNumber=2 + pageSize=2 (default: sortDirection=desc, sortBy=createdAt)`, async () => {
    const result = await request(app)
      .get(`/hometask-03/blogs`)
      .query(`pageNumber=2&pageSize=2`);

    expect(result.body).toEqual({
      pagesCount: 2,
      page: 2,
      pageSize: 2,
      totalCount: 4,
      items: [arrayOfBlogs[1], arrayOfBlogs[0]],
    });
  });

  it(`Pagination-GET: sortDirection=asc + sortBy=name + searchNameTerm=i
    (default: pageNumber=10, pageNumber=1)`, async () => {
    const result = await request(app)
      .get(`/hometask-03/blogs`)
      .query(`sortDirection=asc&sortBy=name&searchNameTerm=i`);

    expect(result.body).toEqual({
      pagesCount: 1,
      page: 1,
      pageSize: 10,
      totalCount: 3,
      items: [arrayOfBlogs[1], arrayOfBlogs[2], arrayOfBlogs[3]],
    });
  });

  it(`Pagination-GET: sortDirection=asc + sortBy=description + pageNumber=2 + pageSize=3`, async () => {
    const result = await request(app)
      .get(`/hometask-03/blogs`)
      .query(`sortDirection=asc&sortBy=description&pageNumber=2&pageSize=3`);

    expect(result.body).toEqual({
      pagesCount: 2,
      page: 2,
      pageSize: 3,
      totalCount: 4,
      items: [arrayOfBlogs[3]],
    });
  });
});
*/
