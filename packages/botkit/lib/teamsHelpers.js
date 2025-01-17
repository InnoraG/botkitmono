"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamsInvokeMiddleware = exports.TeamsBotWorker = void 0;
const botworker_1 = require("./botworker");
const botbuilder_1 = require("botbuilder");
/**
 * This is a specialized version of [Botkit's core BotWorker class](core.md#BotWorker) that includes additional methods for interacting with Microsoft Teams.
 * It includes all functionality from the base class, as well as the extension methods below.
 * This BotWorker is used with the built-in Bot Framework adapter.
 * @noInheritDoc
 */
class TeamsBotWorker extends botworker_1.BotWorker {
    constructor() {
        super(...arguments);
        /**
         * Grants access to the TeamsInfo helper class
         * See: https://docs.microsoft.com/en-us/javascript/api/botbuilder/teamsinfo?view=botbuilder-ts-latest
         */
        this.teams = botbuilder_1.TeamsInfo;
    }
    /**
     * Reply to a Teams task module task/fetch or task/submit with a task module response.
     * See https://docs.microsoft.com/en-us/microsoftteams/platform/task-modules-and-cards/task-modules/task-modules-bots
     * @param message
     * @param taskInfo an object in the form {type, value}
     */
    replyWithTaskInfo(message, taskInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!taskInfo || taskInfo === {}) {
                // send a null response back
                taskInfo = {
                    type: 'message',
                    value: ''
                };
            }
            return new Promise((resolve, reject) => {
                this.controller.middleware.send.run(this, taskInfo, (err, bot, taskInfo) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        return reject(err);
                    }
                    resolve(yield this.getConfig('context').sendActivity({
                        type: 'invokeResponse',
                        value: {
                            status: 200,
                            body: {
                                task: taskInfo
                            }
                        }
                    }));
                }));
            });
        });
    }
}
exports.TeamsBotWorker = TeamsBotWorker;
/**
 * When used, causes Botkit to emit special events for teams "invokes"
 * Based on https://github.com/microsoft/botbuilder-js/blob/master/libraries/botbuilder/src/teamsActivityHandler.ts
 * This allows Botkit bots to respond directly to task/fetch or task/submit events, as an example.
 * To use this, bind it to the adapter before creating the Botkit controller:
 * ```javascript
 * const Botkit = new Botkit({...});
 * botkit.adapter.use(new TeamsInvokeMiddleware());
 *
 * // can bind directly to task/fetch, task/submit and other invoke types used by teams
 * controller.on('task/fetch', async(bot, message) => {
 *    await bot.replyWithTaskInfo(message, taskInfo);
 * });
 * ```
 */
class TeamsInvokeMiddleware extends botbuilder_1.MiddlewareSet {
    /**
     * Not for direct use - implements the MiddlewareSet's required onTurn function used to process the event
     * @param context
     * @param next
     */
    onTurn(context, next) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.activity.type === 'invoke') {
                if (!context.activity.name && context.activity.channelId === 'msteams') {
                    context.activity.channelData.botkitEventType = 'cardAction';
                }
                else {
                    switch (context.activity.name) {
                        case 'fileConsent/invoke':
                        case 'actionableMessage/executeAction':
                        case 'composeExtension/queryLink':
                        case 'composeExtension/query':
                        case 'composeExtension/selectItem':
                        case 'composeExtension/submitAction':
                        case 'composeExtension/fetchTask':
                        case 'composeExtension/querySettingUrl':
                        case 'composeExtension/setting':
                        case 'composeExtension/onCardButtonClicked':
                        case 'task/fetch':
                        case 'task/submit':
                            context.activity.channelData.botkitEventType = context.activity.name;
                            break;
                    }
                }
            }
            yield next();
        });
    }
}
exports.TeamsInvokeMiddleware = TeamsInvokeMiddleware;
//# sourceMappingURL=teamsHelpers.js.map