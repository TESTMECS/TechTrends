import { Express } from "express";
import { authRouter } from "./auth";
import { articleRouter } from "./article";
import { userRouter } from "./user";
import { friendRouter } from "./friend";
import { globalArticlesRouter } from "./globalArticles";
import { tagSearchRouter } from "./tagSearch";
import { articleOTWRouter } from "./articleOfTheWeek";
import { commentRouter } from "./comment";
import { commentsRouter } from "./comments";
export function createRoutesWith(app: Express) {
  // app.use('/api/example', exampleRouter);
  app.use("/api/auth", authRouter);
  app.use("/api/friend", friendRouter);
  app.use("/api/article", articleRouter);
  app.use("/api/user", userRouter);
  app.use("/api/global", globalArticlesRouter);
  app.use("/api/tag-search", tagSearchRouter);
  app.use("/api/article-of-the-week", articleOTWRouter);
  app.use("/api/comment", commentRouter);
  app.use("/api/comments", commentsRouter);
  app.use("*", (_, res) => {
    res.status(404).json({ error: "Not found" });
  });
}
