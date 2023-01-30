import { FromSchema } from "json-schema-to-ts";
import { FastifyPluginAsync } from "fastify";
import fastifyMultipart from "fastify-multipart";
import emailAddresses, { ParsedGroup, ParsedMailbox } from "email-addresses";
import { ServiceError } from "@/services/ServiceError";
import { ClientErrors } from "@/types/errors";

interface ClientData {
  name?: string;
  email: string;
}

const schema = {
  body: {
    type: "object",
    required: ["from", "to"],
    properties: {
      /**
       * Examples:
       * "CompanyName <manager@company.com>"
       * "manager@company.com"
       */
      from: {
        properties: {
          value: {
            type: "string",
          },
        },
      },
      /**
       * Examples:
       * "ClientName <client@gmail.com>"
       * "client@gmail.com"
       * "ClientName <client@gmail.com>, client@gmail.com"
       */
      to: {
        properties: {
          value: {
            type: "string",
          },
        },
      },
    },
  },
} as const;

export const routeOfImportFromEmail: FastifyPluginAsync = async (fastify) => {
  fastify.register(fastifyMultipart, {
    attachFieldsToBody: true,
  });
  fastify.route<{ Body: FromSchema<typeof schema.body> }>({
    method: "POST",
    url: "/import-from-email",
    schema,
    async handler(request, reply) {
      // @ts-ignore
      const from = request.body.from.value as string;
      // @ts-ignore
      const to = request.body.to.value as string;

      fastify.log.info(
        { from, to },
        "####### IMPORT CLIENT FROM EMAIL #########"
      );

      // Resolve company
      const parsedFrom = emailAddresses.parseOneAddress(from);
      const companyEmail =
        parsedFrom?.type === "mailbox" ? parsedFrom.address : "";
      if (!companyEmail) {
        fastify.log.error(
          `routeOfImportFromEmail ${ClientErrors.FieldFromRequired}`
        );
        return reply.status(400).send({
          code: ClientErrors.FieldFromRequired,
        });
      }
      const company =
        await fastify.resources.companyService.getCompanyByEmailForImportHook(
          companyEmail
        );
      if (!company) {
        fastify.log.error(
          `routeOfImportFromEmail ${ClientErrors.CompanyEmailInvalid}`
        );
        return reply
          .status(400)
          .send({ code: ClientErrors.CompanyEmailInvalid });
      }

      // Resolve clients
      const parsedTo = emailAddresses.parseAddressList(to) || [];
      const clientsData = parsedTo.reduce((result, item) => {
        result = result.concat(getClientsDataFromAddress(item));
        return result;
      }, [] as ClientData[]);

      try {
        await fastify.resources.clientService.importClients(
          company._id,
          clientsData,
          true,
          company.bccDelay
        );
      } catch (e) {
        if (e instanceof ServiceError) {
          if (e.code == ClientErrors.ClientDuplicated) {
            return reply
              .code(400)
              .send({ code: ClientErrors.ClientDuplicated });
          }
        }
        fastify.log.error(e, ClientErrors.ClientUnhandledError);
        return reply
          .code(500)
          .send({ code: ClientErrors.ClientUnhandledError });
      }

      return {};
    },
  });
};

function getClientsDataFromAddress(
  item: ParsedMailbox | ParsedGroup
): ClientData[] {
  if (item?.type === "mailbox") {
    return [
      {
        name: item.name || "",
        email: item.address,
      },
    ];
  } else if (item?.type === "group") {
    return item.addresses.map(({ name, address }) => ({
      name,
      email: address,
    }));
  }
  return [];
}
