import { FastifyPluginAsync } from "fastify";
import { routeOfCreateReview } from "./routeOfCreateReview";
import { routeOfGetTokenInfo } from "./routeOfGetTokenInfo";
import { routeOfGetReviews } from "./routeOfGetReviews";
import { routeOfGetReviewById } from "./routeOfGetReviewById";
import { routeOfCreateReply } from "./routeOfCreateReply";
import { routeOfCreateReport } from "./routeOfCreateReport";
import { routeOfRemoveReview } from "./routeOfRemoveReview";
import { routeOfDenyReport } from "./routeOfDenyReport";
import { routeOfGetReportedReviews } from "./routeOfGetReportedReviews";
import { routeOfExportCsv } from "@/routes/review/routeOfExportCsv";
import { routeOfUpdateReview } from "@/routes/review/routeOfUpdateReview";
import { routeOfEmailPreview } from "./routeOfEmailPreview";
import { routeOfAnonymousReport } from "./routeofAnonymousReport";

export const reviewRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(routeOfCreateReview);
  fastify.register(routeOfGetTokenInfo);
  fastify.register(routeOfGetReviews);
  fastify.register(routeOfGetReviewById);
  fastify.register(routeOfCreateReply);
  fastify.register(routeOfCreateReport);
  fastify.register(routeOfDenyReport);
  fastify.register(routeOfEmailPreview);
  fastify.register(routeOfRemoveReview);
  fastify.register(routeOfGetReportedReviews);
  fastify.register(routeOfExportCsv);
  fastify.register(routeOfUpdateReview);
  fastify.register(routeOfAnonymousReport);
};
