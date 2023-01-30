import {
  CloudWatchLogsClient,
  GetQueryResultsCommand,
  GetQueryResultsResponse,
  QueryStatus,
  ResultField,
  StartQueryCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import { delay } from "@/helpers/helpFunctions";
import { FastifyLoggerInstance } from "fastify";

interface Config {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  logGroupNames: string[];
  recordsLimit: number;
}

export class AWSCloudWatchLogsService {
  private config: Config;
  private client: CloudWatchLogsClient;
  private logger: FastifyLoggerInstance;

  constructor(config: Config, logger: FastifyLoggerInstance) {
    this.logger = logger;
    this.config = config;
    this.client = new CloudWatchLogsClient({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  async getErrorEvents(
    startTime: number,
    endTime: number,
    limit: number | null = null,
    logGroupNames: string[] | null = null
  ): Promise<ResultField[][] | undefined> {
    let queryId: string | undefined;

    if (!this.config.accessKeyId || !this.config.secretAccessKey) {
      this.logger.warn(`CloudWatchLogs empty access keys`);
      return;
    }

    try {
      const data = await this.startQuery(
        endTime,
        limit || this.config.recordsLimit,
        startTime,
        logGroupNames || this.config.logGroupNames
      );

      let res: GetQueryResultsResponse;
      queryId = data.queryId;
      do {
        res = await this.client.send(
          new GetQueryResultsCommand({
            queryId: queryId,
          })
        );

        if (res.status === QueryStatus.Scheduled) {
          await delay(5000);
        }
      } while (
        res.status === QueryStatus.Running ||
        res.status === QueryStatus.Scheduled
      );
      this.logger.info(`CloudWatchLogs Query ID: ${data.queryId}`);
      this.logger.info(`CloudWatchLogs Status: ${res.status}`);
      this.logger.info(
        `CloudWatchLogs Length of result: ${res.results?.length}`
      );

      return res.results;
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async startQuery(
    endTime: number,
    limit: number,
    startTime: number,
    logGroupNames: string[]
  ) {
    return await this.client.send(
      new StartQueryCommand({
        endTime,
        queryString:
          "fields @timestamp, @message\n" +
          "    | filter level = 50\n" +
          "    | sort @timestamp desc\n" +
          `    | limit ${limit}`,
        startTime,
        logGroupNames,
        limit,
      })
    );
  }
}
