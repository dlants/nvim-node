import { createWriteStream } from "node:fs";
import winston from "winston";
import { MessageType, type RPCMessage } from "./types.ts";

export function createLogger(filePath?: string, logLevel = "verbose") {
    if (!filePath) return;

    const stream = createWriteStream(filePath);

    return winston.createLogger({
        level: logLevel,
        transports: [
            new winston.transports.Stream({
                stream,
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.timestamp({ format: "HH:mm:ss.SSS" }),
                    winston.format.printf((info) => `\n${info.level} ${info.timestamp}`),
                ),
            }),
            new winston.transports.Stream({
                stream,
                format: winston.format.prettyPrint({
                    colorize: true,
                    depth: 5,
                }),
            }),
        ],
    });
}

export function prettyRPCMessage(message: RPCMessage, direction: "out" | "in") {
    const prefix = direction === "out" ? "OUTGOING" : "INCOMING";

    if (message[0] === MessageType.REQUEST) {
        return {
            [`${prefix}_REQUEST`]: {
                reqId: message[1],
                method: message[2],
                params: message[3],
            },
        };
    }

    if (message[0] === MessageType.RESPONSE) {
        return {
            [`${prefix}_RESPONSE`]: {
                reqId: message[1],
                error: message[2],
                result: message[3],
            },
        };
    }

    // if (message[0] === MessageType.NOTIFY)
    return {
        [`${prefix}_NOTIFICATION`]: {
            event: message[1],
            args: message[2],
        },
    };
}
