enyo.kind(
    {
        name: "wg.models.udRandom",
        kind: "WebService",
        url:"http://www.urbandictionary.com/iphone/search/random",
        onSuccess: "gotRandomResults",
        onFailure: "gotRandomFailure",
        gotRandomResults: function(inSender, inResponse, inRequest) {
            // stuff
        },
        gotRandomFailure: function(inSender, inResponse, inRequest) {
            // stuff
        }
    }
);