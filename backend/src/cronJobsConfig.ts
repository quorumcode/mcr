import { Config } from "fastify-cron";
import { FastifyInstance } from "fastify";
import { Review } from "@/models/Review";
import subMonths from "date-fns/subMonths";
import { Company, CompanyDoc } from "@/models/Company";
import { EmailTemplateName, SubscriptionStatus } from "@/types/common";
import { UserDoc } from "@/models/User";
import { addMinutes, addYears } from "date-fns";
import csvParse from "csv-parse/lib/sync";
import path from "path";
import { Client } from "./models/Client";
import randToken from "rand-token";
import { ServiceError } from "./services/ServiceError";
import { BillingErrors } from "./types/errors";
import {
  CloudWatchLogsClient,
  GetQueryResultsCommand,
  GetQueryResultsResponse,
  QueryStatus,
  StartQueryCommand,
} from "@aws-sdk/client-cloudwatch-logs";
const fs = require("fs");

interface CsvReviewRecord {
  reviewDate: Date;
  name: string;
  rate: string;
  message: string;
  replyDate: Date;
  replyMessage: string;
}

const delayToUpdateOwnerData = 30;
const ownerUpdaterCronTime = addMinutes(new Date(), delayToUpdateOwnerData);
const ownerUpdaterMinutes = ownerUpdaterCronTime.getMinutes();
const ownerUpdaterHour = ownerUpdaterCronTime.getHours();

export const cronJobsConfig: Config = {
  jobs: [
    {
      name: "emailReminder",
      cronTime: "* * * * *",
      // @ts-ignore
      async onTick(fastify: FastifyInstance): Promise<void> {
        const emails =
          await fastify.resources.invitationService.getRemindNeededEmails(100);

        if (!emails.length) {
          return;
        }

        const jobs = emails.map((email) => {
          return fastify.resources.invitationService.sendReviewInvitationRemind(
            email
          );
        });

        const results = await Promise.allSettled(jobs);
        const isEpicFail = results.every(({ status }) => status === "rejected");

        if (isEpicFail) {
          // TODO use logger
          console.error("ERROR_REMINDER", results);
        }
      },
    },
    {
      name: "reviewsReportsCleaner",
      cronTime: "* * * * *",
      // @ts-ignore
      async onTick(): Promise<void> {
        await Review.updateMany(
          {
            reportedAt: { $lt: subMonths(new Date(), 1) },
            isRemoved: { $ne: true },
          },
          {
            $unset: {
              reportedAt: 1,
            },
          }
        );
      },
    },
    {
      name: "trialSubscriptionsCleaner",
      cronTime: "* * * * *",
      // @ts-ignore
      async onTick(): Promise<void> {
        await Company.updateMany(
          {
            "subscription.status": SubscriptionStatus.trialing,
            "subscription.periodEndAt": { $lt: new Date() },
          },
          {
            $unset: {
              subscription: 1,
            },
          }
        );
      },
    },
    {
      name: "trialEndingReminder",
      cronTime: "* * * * *",
      // @ts-ignore
      async onTick(fastify: FastifyInstance): Promise<void> {
        const companies =
          await fastify.resources.billingService.getTrialEndingCompaniesForRemind();

        if (!companies.length) {
          return;
        }

        const jobs = companies.map((company) => {
          try {
            return fastify.resources.billingService.sendTrialEndingRemind(
              company
            );
          } catch (e) {
            if (e instanceof ServiceError) {
              if (e.code === BillingErrors.CompanySubscriptionNotFound) {
                fastify.log.warn(
                  `ERROR_REMINDER. ${BillingErrors.CompanySubscriptionNotFound} for company ID ${company.id}}`
                );
              }
            } else {
              fastify.log.error(e, "ERROR_REMINDER");
            }
          }
        });

        const results = await Promise.allSettled(jobs);
        const isEpicFail = results.every(({ status }) => status === "rejected");

        if (isEpicFail) {
          fastify.log.error("ERROR_REMINDER", results);
        }
      },
    },
    {
      name: "bccClientsInviter",
      cronTime: "*/2 * * * *",
      // @ts-ignore
      async onTick(fastify: FastifyInstance): Promise<void> {
        fastify.log.info("bccClientsInviter. Started");
        const clients =
          await fastify.resources.clientService.getClientsForInviter();

        if (!clients.length) {
          fastify.log.info("bccClientsInviter. Clients for invite not found");
          return;
        }

        clients.forEach(async (client) => {
          const company =
            (await fastify.resources.companyService.getCompanyById(
              client.company.toString()
            )) as CompanyDoc;
          if (!company) {
            fastify.log.warn(
              `bccClientsInviter. Company for ${client.email} not found`
            );
            return;
          }

          await fastify.resources.invitationService.sendReviewInvite({
            company,
            client,
            emailTemplateName: EmailTemplateName.invitation,
          });
        });

        fastify.log.info("bccClientsInviter. Ended");
      },
    },
    {
      name: "OwnerDataUpdater",
      cronTime: `${ownerUpdaterMinutes} ${ownerUpdaterHour} * * *`,
      // @ts-ignore
      async onTick(fastify: FastifyInstance): Promise<void> {
        fastify.log.info("OwnerDataUpdater. Started");
        let user: UserDoc;
        try {
          // Owner User Data Update
          const ownerPass = process.env.OWNER_PASSWORD
            ? process.env.OWNER_PASSWORD
            : "12345678";
          user = await fastify.resources.userService.createUser({
            name: "Maurice Pratt",
            email: "mpratt@nationwideclaims.com.au",
            password: ownerPass,
          });

          const verifyCode = user.verifyEmailCode as string;
          await fastify.resources.userService.verifyUserEmail(verifyCode);

          const alreadyAddedCompany =
            await fastify.resources.companyService.getCompanyByUser(user.id);
          if (alreadyAddedCompany) {
            fastify.log.warn("OwnerDataUpdater. Company already added.");
            return;
          }

          // Owner Company Data Update
          const companyData = {
            name: "Nationwide Claims Service",
            categories: ["Finance Broker"],
            address: {
              route: "Reginald Dr",
              streetNumber: "46",
              town: "Terrigal",
              administrativeDivision: "Australia",
              postalCode: "2260",
            },
            about:
              "Nationwide Claims Service is one of Australia’s most experienced unclaimed money agents. Most agents are just one or two people whereas we have SIX full time staff. This allows us to have a wide variety of skills with backgrounds in technology, private investigation, administering deceased estates and customer service.",
            logo: "https://mcr-uploads.s3.ap-southeast-2.amazonaws.com/YNkOdFTGYS8ziSX8",
            webSite: "www.nationwideclaims.com.au",
            contactPhone: "1800411788",
            emailForReviewNotifications: "mpratt@nationwideclaims.com.au",
            emailForNegativeReviewAlerts: "mpratt@nationwideclaims.com.au",
          };

          if (companyData.logo) {
            try {
              companyData.logo = await fastify.resources.imageService.upload(
                companyData.logo
              );
            } catch (e) {
              fastify.log.error(e, "OwnerDataUpdater. Failed to load logo.");
            }
          }

          const company = await fastify.resources.companyService.createCompany(
            companyData,
            user
          );

          company.subscription = {
            status: SubscriptionStatus.active,
            periodStartAt: company.createdAt,
            periodEndAt: addYears(company.createdAt, 10),
          };
          await company.save();

          // Populate Owner Reviews

          const filepath = path.resolve(__dirname, "./static/ownerReviews.csv");
          const fileData = fs.readFileSync(filepath) as Buffer;

          const csvData = csvParse(fileData, {
            columns: true,
            skip_lines_with_error: true,
          }) as CsvReviewRecord[];

          fastify.log.info(`OwnerDataUpdater. ${JSON.stringify(csvData[0])}`);

          csvData.forEach(async (review) => {
            const client = new Client({
              name: review.name,
              email: `${randToken.generate(16)}@mail.au`,
              company: company._id,
              createdAt: new Date(),
              lastInvitedAt: new Date(),
              lastReviewAt: new Date(review.reviewDate),
            });
            await client.save();

            const newReview = new Review({
              company: company._id,
              client: client._id,
              rate: review.rate,
              message: review.message,
              createdAt: new Date(review.reviewDate),
              reply: {
                createdAt: new Date(review.replyDate),
                message: review.replyMessage,
              },
            });
            await newReview.save();
          });
        } catch (e) {
          fastify.log.warn(e, "OwnerDataUpdater. Failed.");
        } finally {
          fastify.log.info("OwnerDataUpdater. Ended");
        }
      },
    },
    {
      name: "sendUnhandledLogs",
      cronTime: "0 1 * * *",
      // @ts-ignore
      onTick: async function (fastify: FastifyInstance): Promise<void> {
        const daySeconds = 24 * 60 * 60;
        const startSecondsOffset: number = process.env
          .CLOUD_WATCH_LOGS_START_SECONDS_OFFSET
          ? parseInt(process.env.CLOUD_WATCH_LOGS_START_SECONDS_OFFSET)
          : daySeconds;
        const startTime = Date.now() - startSecondsOffset;
        const endTime = Date.now();

        fastify.log.info(`sendUnhandledLogs - start`);
        fastify.log.info(
          `sendUnhandledLogs - fetch period: ${startTime} - ${endTime}`
        );

        const errorEvents =
          await fastify.resources.cloudWatchLogsService.getErrorEvents(
            startTime,
            endTime
          );

        fastify.log.info(
          `sendUnhandledLogs - fetch period: ${startTime} - ${endTime}`
        );

        if (!errorEvents || errorEvents.length === 0) {
          fastify.log.info(`sendUnhandledLogs - empty log events`);
          return;
        }

        const body = errorEvents?.reduce(
          (previousValue, currentValue) =>
            `${previousValue} <br> <br> ${currentValue[0]?.value} : ${
              JSON.parse(currentValue[1]?.value || "{}")?.msg
            }`,
          ""
        );

        const buff = Buffer.from(JSON.stringify(errorEvents));

        fastify.log.info(
          `sendUnhandledLogs - send log events to ${process.env.CLOUD_WATCH_LOGS_TO_EMAIL}`
        );

        await fastify.resources.mailService.sgSendWithFile(
          process.env.CLOUD_WATCH_LOGS_TO_EMAIL?.split(",").map((s) =>
            s.trim()
          ),
          JSON.stringify(body),
          buff.toString("base64")
        );

        fastify.log.info(`sendUnhandledLogs - end`);
      },
    },
  ],
};
