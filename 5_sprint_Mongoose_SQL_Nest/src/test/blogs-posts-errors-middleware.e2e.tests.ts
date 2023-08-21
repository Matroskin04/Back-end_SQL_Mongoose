/*
import { describe } from 'node:test';
const request = require('supertest');
import { mongoURL } from '../infrastructure/db';
import { app } from '../setting';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { BlogDocument } from '../blogs/domain/blogs-schema-model';
import { PostModel } from '../posts/domain/posts-schema-model';

const generalBlogInputData = {
  name: 'Blog1-IT-beard',
  description: 'Fantastic description',
  websiteUrl:
    'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
};
let idOfBlog: ObjectId | null = null;
let idOfDeletedBlog: ObjectId | null = null;

let idOfPost: ObjectId | null = null;

describe('POST: /blogs', () => {
  beforeAll(async () => {
    await mongoose.connection.close();
    await mongoose.connect(mongoURL);

    await request(app).delete('/hometask-03/testing/all-data').expect(204);
  }); 

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('+ should create 4 new blogs without errors', async () => {
    //1 blog
    const response1 = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(generalBlogInputData);

    expect(response1.status).toBe(201);

    const newBlog = response1.body;
    expect(newBlog).toEqual({
      id: expect.any(String),
      name: generalBlogInputData.name,
      description: generalBlogInputData.description,
      websiteUrl: generalBlogInputData.websiteUrl,
      createdAt: expect.any(String),
      isMembership: false,
    });

    //2 blog
    const blogInputData2 = {
      name: 'Blog2-Incubator',
      description: 'Fantastic description2',
      websiteUrl:
        'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
    };

    const response2 = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData2);

    expect(response2.status).toBe(201);

    //3 blog
    const blogInputData3 = {
      name: 'Blog3-IT',
      description: 'Fantastic description3',
      websiteUrl:
        'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
    };

    const response3 = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData3);

    expect(response3.status).toBe(201);

    //4 blog
    const blogInputData4 = {
      name: 'Blog4-Function',
      description: 'Fantastic description2',
      websiteUrl:
        'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
    };

    const response4 = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData4);

    expect(response4.status).toBe(201);

    const allBlogs = await BlogModel.find().lean();
    expect(allBlogs.length).toBe(4);

    idOfBlog = response4.body.id;
    idOfDeletedBlog = response3.body.id;
  });

  it('- BAD AUTH TOKEN => should return status 401: unauthorized', async () => {
    const response = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'wrong_password')
      .send(generalBlogInputData);

    expect(response.status).toBe(401);
  });

  it('- WITHOUT AUTH TOKEN => should return status 401: unauthorized', async () => {
    const response = await request(app)
      .post('/hometask-03/blogs')
      .send(generalBlogInputData);

    expect(response.status).toBe(401);
  });

  it(`- INVALID INPUT BODY DATA => should return status 400 with error:
                    the large length of the name`, async () => {
    const blogInputData = {
      name: 'The length is more than 15 symbols',
      description: 'Fantastic description',
      websiteUrl:
        'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
    };

    const response = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData);

    expect(response.status).toBe(400);
    const error = response.body;
    expect(error).toEqual({
      errorsMessages: [
        {
          message: 'The length should be less than 16',
          field: 'name',
        },
      ],
    });
  });

  it(`- INVALID INPUT BODY DATA => should return status 400 with 3 errors:
         type, incorrect the key, invalid URL`, async () => {
    const blogInputData = {
      name: null,
      descriptio: 'Fantastic description',
      websiteUrl: 'invalid URL',
    };

    const response = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData);

    expect(response.status).toBe(400);
    const error = response.body;
    expect(error).toEqual({
      errorsMessages: [
        {
          message: 'It should be a string',
          field: 'name',
        },
        {
          message: "There isn't such parameter",
          field: 'description',
        },
        {
          message: 'It should be valid URL',
          field: 'websiteUrl',
        },
      ],
    });
  });

  it(`- INVALID INPUT BODY DATA => should return status 400 with 3 errors:
         incorrect the key, type, type`, async () => {
    const blogInputData = {
      nam: 'Normal name',
      description: null,
      websiteUrl: null,
    };

    const response = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData);

    expect(response.status).toBe(400);
    const error = response.body;
    expect(error).toEqual({
      errorsMessages: [
        {
          message: "There isn't such parameter",
          field: 'name',
        },
        {
          message: 'It should be a string',
          field: 'description',
        },
        {
          message: 'It should be a string',
          field: 'websiteUrl',
        },
      ],
    });
  });

  it(`- INVALID INPUT BODY DATA => should return status 400 with 3 errors:
         empty string, empty, type`, async () => {
    const blogInputData = {
      name: '            ',
      description: '    ',
      websiteUrl: null,
    };

    const response = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData);

    expect(response.status).toBe(400);
    const error = response.body;
    expect(error).toEqual({
      errorsMessages: [
        {
          message: 'The string should not be empty',
          field: 'name',
        },
        {
          message: 'The string should not be empty',
          field: 'description',
        },
        {
          message: 'It should be a string',
          field: 'websiteUrl',
        },
      ],
    });
  });

  it(`- INVALID INPUT BODY DATA => should return status 400 with 2 errors: length, wrong the key`, async () => {
    const blogInputData = {
      name: '         Normal Name          ',
      description:
        'More then 500 characters. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. Ut wisi enim ad minim veniam, quis nostrud exerci tation ullamcorper suscipit lobortis nisl ut aliquip ex ea commodo consequat. Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit end!',
      websiteUr:
        'https://X_KNUz73OyaQyC5mFWT3tOVUms1bLawUwAXd2Utcv.c8NL3uQvj28pqV5f2iG.0KYjO0bYH6EvRIMcomgzMCgHFyXedF',
    };

    const response = await request(app)
      .post('/hometask-03/blogs')
      .auth('admin', 'qwerty')
      .send(blogInputData);

    expect(response.status).toBe(400);
    const error = response.body;
    expect(error).toEqual({
      errorsMessages: [
        {
          message: `The description's length should be less than 501`,
          field: 'description',
        },
        {
          message: "There isn't such parameter",
          field: 'websiteUrl',
        },
      ],
    });
  });
});

describe('POST: /posts and /posts/{postId}/comments', () => {
  it('+ should create 3 new posts without errors', async () => {
    console.log(idOfBlog);
    //1 post
    const postInputData1 = {
      title: 'Post1',
      shortDescription: 'shortDescription',
      content: 'content',
      blogId: idOfBlog,
    };
    const response1 = await request(app)
      .post('/hometask-03/posts')
      .auth('admin', 'qwerty')
      .send(postInputData1);

    expect(response1.status).toBe(201);

    const newPost = response1.body;
    expect(newPost).toEqual({
      id: expect.any(String),
      title: 'Post1',
      shortDescription: 'shortDescription',
      content: 'content',
      blogId: idOfBlog,
      blogName: expect.any(String),
      createdAt: expect.any(String),
    });

    //2 post
    const postInputData2 = {
      title: 'Post2',
      shortDescription: 'shortDescription2',
      content: 'content2',
      blogId: idOfBlog,
    };

    const response2 = await request(app)
      .post('/hometask-03/posts')
      .auth('admin', 'qwerty')
      .send(postInputData2);

    expect(response2.status).toBe(201);

    //3 post
    const postInputData3 = {
      title: 'Post3',
      shortDescription: 'shortDescription3',
      content: 'content3',
      blogId: idOfBlog,
    };

    const response3 = await request(app)
      .post('/hometask-03/posts')
      .auth('admin', 'qwerty')
      .send(postInputData3);

    expect(response3.status).toBe(201);

    const allPosts = await PostModel.find().lean();
    expect(allPosts.length).toBe(3);

    idOfPost = response3.body.id;
  });

  it(`- INVALID INPUT BODY DATA => should return status 400 with 3 errors:
                    the large length of the title, shortDescription, content is not a string`, async () => {
    const postInputData = {
      title: 'Too Large1234561234512345612345',
      shortDescription:
        'Too Large12345612345123456123451234512345123451234512345123541253124512351523512341243512351532414341',
      content: null,
      blogId: idOfBlog,
    };

    const response = await request(app)
      .post('/hometask-03/posts')
      .auth('admin', 'qwerty')
      .send(postInputData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'title',
        },
        {
          message: expect.any(String),
          field: 'shortDescription',
        },
        {
          message: expect.any(String),
          field: 'content',
        },
      ],
    });
  });

  it(`- INVALID INPUT BODY DATA => should return status 400 with 3 errors:
                    title, shortDescription aren't a string, blogId doesn't exist`, async () => {
    //delete blog
    await request(app)
      .delete(`/hometask-03/blogs/${idOfDeletedBlog}`)
      .auth('admin', 'qwerty')
      .expect(204);

    const postInputData1 = {
      title: null,
      shortDescription: null,
      content: 'Normal content',
      blogId: idOfDeletedBlog,
    };

    const response1 = await request(app)
      .post('/hometask-03/posts')
      .auth('admin', 'qwerty')
      .send(postInputData1);

    expect(response1.status).toBe(400);
    expect(response1.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'title',
        },
        {
          message: expect.any(String),
          field: 'shortDescription',
        },
      ],
    });

    const postInputData2 = {
      title: 'title',
      shortDescription: 'Normal shortDescription',
      content: 'Normal content',
      blogId: idOfDeletedBlog,
    };

    const response2 = await request(app)
      .post('/hometask-03/posts')
      .auth('admin', 'qwerty')
      .send(postInputData2);

    expect(response2.status).toBe(400);
    expect(response2.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'blogId',
        },
      ],
    });
  });

  it(`- INVALID INPUT BODY DATA => should return status 400 with 3 errors:
                    title, shortDescription are empty, blogId is not a string`, async () => {
    const postInputData = {
      title: '                  ',
      shortDescription: '           ',
      content: 'content',
      blogId: null,
    };

    const response = await request(app)
      .post('/hometask-03/posts')
      .auth('admin', 'qwerty')
      .send(postInputData);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'title',
        },
        {
          message: expect.any(String),
          field: 'shortDescription',
        },
        {
          message: expect.any(String),
          field: 'blogId',
        },
      ],
    });
  });
});
*/
