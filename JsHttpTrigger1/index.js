const appInsights = require("applicationinsights");
appInsights.setup(process.env["APPINSIGHTS_INSTRUMENTATIONKEY"])
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
 * No changes required to your existing Function logic
 */
const httpTrigger = async function (context, req) {
    context.log.info("hello world");
    appInsights.defaultClient.trackTrace({message: "trace message"});
    const response = await axios.get(process.env["downstreamurl"] + "?name=demo");

    context.res = {
        status: response.status,
        body: response.data,
    };
};

// Default export wrapped with Application Insights FaaS context propagation
module.exports = async function (context, req) {
    // Start an AI Correlation Context using the provided Function context
    const correlationContext = appInsights.startOperation(context, req);

    // Wrap the Function runtime with correlationContext
    return appInsights.wrapWithCorrelationContext(async () => {
        const startTime = Date.now(); // Start trackRequest timer

        // Run the Function
        await httpTrigger(context, req);

        appInsights.defaultClient.flush();
    }, correlationContext)();
};