import { FastifyPluginAsync } from "fastify";
import { routeOfGetPages } from "./routeOfGetPages";
import { routeOfCreatePage } from "./routeOfCreatePage";
import { routeOfGetPage } from "./routeOfGetPage";
import { routeOfUpdatePage } from "./routeOfUpdatePage";
import { routeOfRemovePage } from "./routeOfRemovePage";
import { routeOfUploadImage } from "./routeOfUploadImage";

export const pageRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(routeOfGetPages);
  fastify.register(routeOfGetPage);
  fastify.register(routeOfCreatePage);
  fastify.register(routeOfUpdatePage);
  fastify.register(routeOfRemovePage);
  fastify.register(routeOfUploadImage);
};
