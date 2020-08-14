const appInsights = require("applicationinsights");
appInsights.setup("64667cee-033a-474a-91a7-cc7f07fd31be")
    .setAutoCollectPerformance(false)
    .start();

const axios = require("axios");

/**
 * No changes required to your existing Function logic
 */
const httpTrigger = async function (context, req) {
    const response = await axios.get("https://httpbin.org/status/200");

    context.res = {
        status: response.status,
        body: response.statusText,
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

        // Track Request on completion
        appInsights.defaultClient.trackRequest({
            name: context.req.method + " " + context.req.url,
            resultCode: context.res.status,
            success: true,
            url: req.url,
            duration: Date.now() - startTime,
            id: correlationContext.operation.parentId,
        });
        appInsights.defaultClient.flush();
    }, correlationContext)();
};