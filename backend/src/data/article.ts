import { users } from "../config/mongoCollections";
import { validateWithType, StatusError } from "../utils/Error";
import { ObjectId } from "mongodb";
import { userSchema } from "../validation/user";
import { User } from "../types/mongo";
/**
 * A function that adds a notification to all users who have followed the user with id `userId`
 * @param userId
 * @param articleId
 */
export async function favoriteArticle(
  userId: string,
  articleId: string,
): Promise<string[]> {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found");
  }
  const userData = validateWithType<User>(userSchema, user, 500);
  const favoriteArticles = userData.favoriteArticles;
  const articleExists = favoriteArticles.findIndex(
    (value) => value === articleId,
  );
  if (articleExists === -1) {
    favoriteArticles.push(articleId);
  } else {
    throw new StatusError(400, "Article already favorited");
  }
  const insertedInfo = await usersCollection.updateOne(
    {
      _id: ObjectId.createFromHexString(userId),
    },
    {
      $set: {
        favoriteArticles: favoriteArticles,
      },
    },
  );
  if (insertedInfo.modifiedCount === 0) {
    throw new StatusError(500, "Failed to favorite article");
  }
  return favoriteArticles;
}
export async function unfavoriteArticle(
  userId: string,
  articleId: string,
): Promise<string[]> {
  const usersCollection = await users();
  const user = await usersCollection.findOne({
    _id: ObjectId.createFromHexString(userId),
  });
  if (user === null) {
    throw new StatusError(404, "User not found");
  }
  const userData = validateWithType<User>(userSchema, user, 500);
  const favoriteArticles = userData.favoriteArticles;
  const articleExists = favoriteArticles.findIndex(
    (value) => value === articleId,
  );
  if (articleExists === -1) {
    throw new StatusError(400, "Article not favorited");
  } else {
    favoriteArticles.splice(articleExists, 1);
  }
  const insertedInfo = await usersCollection.updateOne(
    {
      _id: ObjectId.createFromHexString(userId),
    },
    {
      $set: {
        favoriteArticles: favoriteArticles,
      },
    },
  );
  if (insertedInfo.modifiedCount === 0) {
    throw new StatusError(500, "Failed to unfavorite article");
  }
  return favoriteArticles;
}
