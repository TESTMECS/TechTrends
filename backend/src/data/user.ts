import { users, comments } from "../config/mongoCollections";
import { StatusError } from "../utils/Error";
import { ObjectId } from "mongodb";
import { Notification } from "../types/mongo";
import { PushOperator } from "mongodb";
import { getArticlesByTags, getDocumentByID } from "./articles";
export async function getUserProfileData(userId: string) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found");
  }
  const commentsCollection = await comments();
  const userComments = await commentsCollection
    .find({
      userId: ObjectId.createFromHexString(userId),
    })
    .toArray();
  // 5 Recent Comments articleId so we can link to the article
  //HERE PRINT TEXT
  const recentComments = userComments.slice(-5).map((comment) => {
    return comment.articleId.toString();
  });
  const recentCommentsWithContent = userComments.slice(-5).map((comment) => {
    return {
      articleId: comment.articleId.toString(),
      content: comment.content
    }
  });
  // returns Articleid
  const recentArticles = user.favoriteArticles.slice(-5).map((article) => {
    return article;
  });
  // All friends.
  const friends = user.friends.map((friend) => {
    return { id: friend._id.toString(), username: friend.username };
  });
  const trends = user.trends.map((trend) => {
    return trend;
  });

  const articlesWithTitles = await Promise.all(
    recentArticles.map(async (articleID) => {
      const document = await getDocumentByID(articleID);
      return {
        _id: articleID,
        title: document?.title,
      };
    })
  );

  const userData = {
    username: user.username,
    recentComments: recentComments,
    recentArticles: recentArticles,
    friends: friends,
    trends: trends,
    articlesWithTitles: articlesWithTitles,
    recentCommentsWithContent: recentCommentsWithContent
  };
  return userData;
}
export async function getFavoriteArticles(userId: string) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found");
  }
  return user.favoriteArticles;
}
export async function addNotification(
  type: string,
  userId: string,
  message: string,
) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found in addNotification.");
  }
  await usersCollection.updateOne(
    {
      _id: ObjectId.createFromHexString(userId),
    },
    {
      $push: {
        notifications: { type, message, timestamp: new Date().toISOString() },
      } as unknown as PushOperator<Notification>,
    },
  );
}
export async function getNotifications(userId: string) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found in getNotifications");
  }
  console.log("Notifications: ", user.notifications);
  return user.notifications;
}
export async function getUserById(id: string) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });
  if (user === null) {
    throw new StatusError(404, "User not found");
  }
  return user;
}
export async function addTrend(userId: string, trend: string) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found");
  }
  if (user.trends.includes(trend)) throw "Trend already exists";
  user.trends.push(trend);
  await usersCollection.updateOne(
    {
      _id: ObjectId.createFromHexString(userId),
    },
    {
      $set: {
        trends: user.trends,
      },
    },
  );
  return user.trends;
}
export async function removeTrend(userId: string, trend: string) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found");
  }
  if (!user.trends.includes(trend)) throw "Trend not found";
  user.trends = user.trends.filter((t) => t !== trend);
  await usersCollection.updateOne(
    {
      _id: ObjectId.createFromHexString(userId),
    },
    {
      $set: {
        trends: user.trends,
      },
    },
  );
  return user.trends;
}
export async function getFollowingFeed(userId: string) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found");
  }
  let articles = (await getArticlesByTags(user.trends))?.map((article: any) => {
    return {
      _id: article?._id,
      title: article?.title,
      author: article?.author,
      publishedAt: article?.publishedAt,
    };
  });
  // for (const article of user.favoriteArticles) {
  //   const fullArticle = await getDocumentByID(article);
  //   articles?.push({
  //     _id: article,
  //     title: fullArticle?.title,
  //     author: fullArticle?.author,
  //     publishedAt: fullArticle?.publishedAt,
  //   });
  // }
  for (const friend of user.friends) {
    const friendArticles = await getFavoriteArticles(friend._id.toString());
    for (const article of friendArticles) {
      const fullArticle = await getDocumentByID(article);
      articles?.push({
        _id: article,
        title: fullArticle?.title,
        author: fullArticle?.author,
        publishedAt: fullArticle?.publishedAt,
      });
    }
  }
  //remove duplicates from articles using the _id as key.
  articles = articles?.filter(
    (article, index) =>
      index ===
      articles?.findIndex((t) => t._id === article._id),
  );
  
  return articles;
}
export async function getFriends(userId: string) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found");
  }
  const friends = user.friends.map((friend) => {
    return friend._id.toString();
  });
  return friends;
}
export async function checkFriendshipStatus(userId: string, friendId: string) {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found");
  }
  const friend = user.friends.find(
    (friend) => friend._id.toString() === friendId,
  );
  return friend !== undefined;
}
