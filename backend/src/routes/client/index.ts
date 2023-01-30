import { FastifyPluginAsync } from "fastify";
import { routeOfImportCsv } from "./routeOfImportCsv";
import { routeOfGetClientsForInvitation } from "./routeOfGetClientsForInvitation";
import { routeOfInvite } from "./routeOfInvite";
import { routeOfImportFromEmail } from "./routeOfImportFromEmail";

export const clientRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.register(routeOfImportCsv);
  fastify.register(routeOfGetClientsForInvitation);
  fastify.register(routeOfInvite);
  fastify.register(routeOfImportFromEmail);
};
