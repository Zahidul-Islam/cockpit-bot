
module.exports = function(session, result, origin) {
    return new builder.Message(session)
        .addAttachment({
            contentType: "application/vnd.microsoft.card.adaptive",
            content: {
                "$schema": "http://adaptivecards.io/schemas/adaptive-card.json",
                "version": "0.5",
                "type": "AdaptiveCard",
                "body": [
                    {
                        "type": "TextBlock",
                        "text": result.departure_date,
                        "weight": "bolder"
                    },
                    {
                        "type": "ColumnSet",
                        "separation": "strong",
                        "columns": [
                            {
                                "type": "Column",
                                "size": 1,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "size": "extraLarge",
                                        "color": "accent",
                                        "text": origin
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": "auto",
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "text": "&nbsp;"
                                    },
                                    {
                                        "type": "Image",
                                        "url": "http://messagecardplayground.azurewebsites.net/assets/airplane.png",
                                        "size": "small"
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": 1,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "horizontalAlignment": "right",
                                        "size": "extraLarge",
                                        "color": "accent",
                                        "text": result.destination
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "TextBlock",
                        "text": "Non-Stop",
                        "separation": "strong",

                        "weight": "bolder"
                    },
                    {
                        "type": "TextBlock",
                        "text": result.return_date,
                        "weight": "bolder"
                    },
                    {
                        "type": "ColumnSet",
                        "columns": [
                            {
                                "type": "Column",
                                "size": 1,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "size": "extraLarge",
                                        "color": "accent",
                                        "text": result.destination
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": "auto",
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "text": "&nbsp;"
                                    },
                                    {
                                        "type": "Image",
                                        "url": "http://messagecardplayground.azurewebsites.net/assets/airplane.png",
                                        "size": "small"
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": 1,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "topSpacing": "none",
                                        "horizontalAlignment": "right",
                                        "size": "extraLarge",
                                        "color": "accent",
                                        "text": origin
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "type": "ColumnSet",
                        "separation": "strong",

                        "columns": [
                            {
                                "type": "Column",
                                "size": "1",
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "text": "Total",
                                        "size": "medium",
                                        "isSubtle": true
                                    }
                                ]
                            },
                            {
                                "type": "Column",
                                "size": 1,
                                "items": [
                                    {
                                        "type": "TextBlock",
                                        "horizontalAlignment": "right", "text": "$ " + result.price,
                                        "size": "medium",
                                        "weight": "bolder"
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        });
}