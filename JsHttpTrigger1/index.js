const appInsights = require("applicationinsights");
appInsights.setup("64667cee-033a-474a-91a7-cc7f07fd31be")
    .setAutoDependencyCorrelation(true)
    .setAutoCollectRequests(true)
    .setAutoCollectPerformance(true, true)
    .setAutoCollectExceptions(true)
    .setAutoCollectDependencies(true)
    .setAutoCollectConsole(true)
    .setUseDiskRetryCaching(true)
    .setSendLiveMetrics(false)
    .setDistributedTracingMode(appInsights.DistributedTracingModes.AI_AND_W3C)
    .start();

const axios = require("axios");

/**
 * Function logic sample from https://github.com/Microsoft/ApplicationInsights-node.js/
 */
const httpTrigger = async function (context, req) {
    // call depend
    const response = await axios.get("https://begimdemohttpfn.azurewebsites.net/api/HttpTrigger2?name=demo");
    // echo result
    context.res = {
        status: response.status,
        body: response.data,
    };
};

// Default export wrapped with Application Insights FaaS context propagation
module.exports = async function (context, req) {
   
    const correlationContext = appInsights.startOperation(context, req);

    return appInsights.wrapWithCorrelationContext(async () => {
        // Run the Function
        await httpTrigger(context, req);

        appInsights.defaultClient.flush();
    }, correlationContext)();
};