export const blogsResponsesTestManager = {
  createResponseAllBlogsSa: function (
    idsOfBlogs: Array<string> | number,
    isMembership?: boolean[] | null,
    totalCount?: number,
    pagesCount?: number,
    page?: number,
    pageSize?: number,
  ) {
    const allBlogs: any = [];
    const limit =
      typeof idsOfBlogs === 'number' ? idsOfBlogs : idsOfBlogs.length;
    for (let i = 0; i < limit; i++) {
      allBlogs.push({
        id: idsOfBlogs[i] ?? expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: isMembership ? isMembership[i] : false,
      });
    }
    return {
      pagesCount: pagesCount ?? 1,
      page: page ?? 1,
      pageSize: pageSize ?? 10,
      totalCount: totalCount ?? 0,
      items: allBlogs,
    };
  },

  createResponseSingleBlogSa: function (
    id?,
    name?,
    description?,
    websiteUrl?,
    isMembership?,
  ) {
    return {
      id: id ?? expect.any(String),
      name: name ?? expect.any(String),
      description: description ?? expect.any(String),
      websiteUrl: websiteUrl ?? expect.any(String),
      createdAt: expect.any(String),
      isMembership: isMembership ?? false,
    };
  },

  createResponseAllBlogsBlogger: function (
    idsOfBlogs: Array<string> | number,
    isMembership?: boolean[] | null,
    totalCount?: number,
    pagesCount?: number,
    page?: number,
    pageSize?: number,
  ) {
    const allBlogs: any = [];
    const limit =
      typeof idsOfBlogs === 'number' ? idsOfBlogs : idsOfBlogs.length;
    for (let i = 0; i < limit; i++) {
      allBlogs.push({
        id: idsOfBlogs[i] ?? expect.any(String),
        name: expect.any(String),
        description: expect.any(String),
        websiteUrl: expect.any(String),
        createdAt: expect.any(String),
        isMembership: isMembership ? isMembership[i] : false,
      });
    }
    return {
      pagesCount: pagesCount ?? 1,
      page: page ?? 1,
      pageSize: pageSize ?? 10,
      totalCount: totalCount ?? 0,
      items: allBlogs,
    };
  },

  createResponseSingleBlogBlogger: function (
    id?,
    name?,
    description?,
    websiteUrl?,
    isMembership?,
  ) {
    return {
      id: id ?? expect.any(String),
      name: name ?? expect.any(String),
      description: description ?? expect.any(String),
      websiteUrl: websiteUrl ?? expect.any(String),
      createdAt: expect.any(String),
      isMembership: isMembership ?? false,
    };
  },
};
