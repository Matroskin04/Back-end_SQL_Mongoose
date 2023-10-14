export const postsResponsesTestManager = {
  createResponseSingleSaPost: function (
    title,
    shortDescription,
    content,
    blogId,
  ) {
    return {
      id: expect.any(String),
      title,
      shortDescription,
      content,
      blogId,
      blogName: expect.any(String),
      createdAt: expect.any(String),
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: 'None',
        newestLikes: [],
      },
    };
  },
};
