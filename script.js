// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '492257460870-9hevog7tfv04aqtmflp58eu2th5vst0o.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly", "https://www.googleapis.com/auth/gmail.readonly"];

var currentWeatherData = null;
var futureWeatherData = null;
var chartLoaded = false;

Date.prototype.addHours = function(h) {
    this.setHours(this.getHours() + h);
    return this;
}

google.charts.load('current', {
    packages: ['corechart', 'line']
});
google.charts.setOnLoadCallback(chartCallback);

function chartCallback() {
    chartLoaded = true;
    drawWeather();
}

function drawWeather() {
    if (chartLoaded && currentWeatherData != null && futureWeatherData != null) {
        //Draw Current Weather Graph
        var today = new Date();
        console.log(today.getMonth());

        var data = new google.visualization.DataTable();
        data.addColumn('datetime', 'X');
        data.addColumn('number', 'Temp');
        data.addColumn('number', 'Precipitation');
        for (var i = 0; i < currentWeatherData.length; i++) {
            var date = new Date(today.getFullYear(), today.getMonth(), today.getDate(), today.getHours() + i, today.getMinutes(), today.getSeconds(), today.getMilliseconds());
            data.addRows([
                [date, currentWeatherData[i].apparentTemperature, currentWeatherData[i].precipProbability * 100]
            ]);
        }

        var currentOptions = {
            hAxis: {
                title: 'Time',
                logScale: false,
                textStyle: {
                    color: "#FFFFFF"
                },
                titleTextStyle: {
                    color: "#FFFFFF"
                },
                color: "#FFFFFF",
                gridlines: {
                    count: -1,
                    units: {
                        days: {
                            format: ['EEE']
                        },
                        hours: {
                            format: ['HH:mm', 'ha']
                        },
                    }
                },
            },
            vAxis: {
                title: 'Degrees',
                logScale: false,
                textStyle: {
                    color: "#FFFFFF"
                },
                titleTextStyle: {
                    color: "#FFFFFF"
                },
                color: "#FFFFFF",
                baseLineColor: "#FFFFFF",
                viewWindowMode: 'explicit',
                viewWindow: {
                    min: 0
                }
            },
            colors: ['#FFFFFF', '#9BACFF'],
            backgroundColor: {
                fill: 'transparent'
            },
            legendTextStyle: {
                color: '#FFFFFF'
            },
            titleTextStyle: {
                color: '#FFFFFF'
            },
            pointSize: 5
        };
        var chart = new google.visualization.LineChart(document.getElementById('current-weather-graph'));
        chart.draw(data, currentOptions);


        //Draw Week Graph
        var today = new Date();

        var data = new google.visualization.DataTable();
        data.addColumn('date', 'X');
        data.addColumn('number', 'Temp');
        data.addColumn('number', 'Precipitation');
        for (var i = 0; i < futureWeatherData.length; i++) {
            var date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i, 0, today.getMinutes(), today.getSeconds(), today.getMilliseconds());
            data.addRows([
                [date, futureWeatherData[i].apparentTemperatureMax, futureWeatherData[i].precipProbability * 100]
            ]);
        }

        var currentOptions = {
            hAxis: {
                title: 'Time',
                logScale: false,
                textStyle: {
                    color: "#FFFFFF"
                },
                titleTextStyle: {
                    color: "#FFFFFF"
                },
                color: "#FFFFFF",
                gridlines: {
                    count: -1,
                    units: {
                        days: {
                            format: ['EEE, MMM dd']
                        },
                        hours: {
                            format: ['HH:mm', 'ha']
                        },
                    }
                },
            },
            vAxis: {
                title: 'Degrees',
                logScale: false,
                textStyle: {
                    color: "#FFFFFF"
                },
                titleTextStyle: {
                    color: "#FFFFFF"
                },
                color: "#FFFFFF",
                baseLineColor: "#FFFFFF",
                viewWindowMode: 'explicit',
                viewWindow: {
                    min: 0
                }
            },
            colors: ['#FFFFFF', '#9BACFF'],
            backgroundColor: {
                fill: 'transparent'
            },
            legendTextStyle: {
                color: '#FFFFFF'
            },
            titleTextStyle: {
                color: '#FFFFFF'
            },
            pointSize: 5
        };
        var chart = new google.visualization.LineChart(document.getElementById('future-weather-graph'));
        chart.draw(data, currentOptions);
    }
}


/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
    gapi.auth.authorize({
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
    var authorizeBtn = $('#authorize');
    if (authResult && !authResult.error) {
        // Hide auth UI, then load client library.
        authorizeBtn.hide();
        $('.content').show();
        loadApis();
    } else {
        // Show auth UI, allowing the user to initiate authorization by
        // clicking authorize button.
        authorizeBtn.show();
        $('.content').hide();
    }
}

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
function handleAuthClick(event) {
    gapi.auth.authorize({
            client_id: CLIENT_ID,
            scope: SCOPES,
            immediate: false
        },
        handleAuthResult);
    return false;
}

/**
 * Load Google Calendar client library. List upcoming events
 * once client library is loaded.
 */
function loadApis() {
    gapi.client.load('calendar', 'v3', listUpcomingEvents);
    gapi.client.load('gmail', 'v1', listEmails);
}


function listEmails() {
    var request = gapi.client.gmail.users.messages.list({
        'userId': 'me',
        'maxResults': 5,
        'q': 'is:unread'
    });

    request.execute(function(resp) {
        var messages = resp.messages;
        for (var i = 0; i < messages.length; i++) {
            var messageRequest = gapi.client.gmail.users.messages.get({
                'userId': 'me',
                'id': messages[i].id
            });

            messageRequest.execute(function(message) {
                var headers = message.payload.headers;
                var fromAddress = "";
                var title = "";
                for (var j = 0; j < headers.length; j++) {
                    if (headers[j].name == "From") {
                        console.log(headers[j].value);
                        fromAddress = headers[j].value;
                    } else if (headers[j].name == 'Subject') {
                        title = headers[j].value;
                    }
                }
                appendEmail(fromAddress, title);
            });
        }
    });
}

function appendEmail(fromAddress, title) {
    var li = $("<li>");
    li.append($("<h3>").text(title));
    li.append($("<p>").text(fromAddress));

    $('.email-list').append(li);
}

/**
 * Print the summary and start datetime/date of the next ten events in
 * the authorized user's calendar. If no events are found an
 * appropriate message is printed.
 */
function listUpcomingEvents() {
    var today = new Date();
    var endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    var request = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': today.toISOString(),
        'timeMax': endOfToday.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    });

    request.execute(function(resp) {
        var events = resp.items;

        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                var whenDate = new Date(when);
                var formattedHours = whenDate.getHours();
                var dayPeriod = "AM";
                if (whenDate.getHours() > 12) {
                    formattedHours = whenDate.getHours() - 12;
                    if (whenDate.getHours() != 24 || whenDate.getHours() != 0 || whenDate.getHours() == 12) {
                        dayPeriod = "PM"
                    }
                }
                var formattedMinutes = whenDate.getMinutes() + "";
                if (formattedMinutes.length < 2) {
                    formattedMinutes = "0" + formattedMinutes;
                }
                var formatedTime = formattedHours + ":" + formattedMinutes + " " + dayPeriod;
                appendEvent(formatedTime + ': ' + event.summary, event.htmlLink, $('.today-event-list'));
            }
        } else {
            appendEvent('No events found.', '#', $('.today-event-list'));
        }

    });

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    var nextDay = new Date();
    nextDay.setDate(tomorrow.getDate());
    nextDay.setHours(23, 59, 59, 999);
    console.log(tomorrow);
    console.log(nextDay);

    var requestTomorrow = gapi.client.calendar.events.list({
        'calendarId': 'primary',
        'timeMin': tomorrow.toISOString(),
        'timeMax': nextDay.toISOString(),
        'showDeleted': false,
        'singleEvents': true,
        'maxResults': 10,
        'orderBy': 'startTime'
    });

    requestTomorrow.execute(function(resp) {
        var events = resp.items;

        if (events.length > 0) {
            for (i = 0; i < events.length; i++) {
                var event = events[i];
                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                var whenDate = new Date(when);
                var formattedHours = whenDate.getHours();
                var dayPeriod = "AM";
                if (whenDate.getHours() > 12) {
                    formattedHours = whenDate.getHours() - 12;
                    if (whenDate.getHours() != 24 || whenDate.getHours() != 0 || whenDate.getHours() == 12) {
                        dayPeriod = "PM"
                    }
                }
                var formattedMinutes = whenDate.getMinutes() + "";
                if (formattedMinutes.length < 2) {
                    formattedMinutes = "0" + formattedMinutes;
                }
                var formatedTime = formattedHours + ":" + formattedMinutes + " " + dayPeriod;
                appendEvent(formatedTime + ': ' + event.summary, event.htmlLink, $('.tomorrow-event-list'));
            }
        } else {
            appendEvent('No upcoming events found.', '#', $('.tomorrow-event-list'));
        }

    });
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendEvent(message, link, list) {
    var item = $('<li>');
    var linkTag = $('<a>');
    var text = $('<h3>');
    text.text(message);
    linkTag.attr('href', link);
    linkTag.append(text);
    item.append(linkTag);
    list.append(item);
}

function displayNews(response) {
    console.log(response);
    var newsList = $(".news-list");
    var entries = response.responseData.feed.entries;
    for (var i = 0; i < entries.length; i++) {
        var item = $('<li>');

        var title = $('<h3>');
        title.text(entries[i].title)

        var link = $('<a>');
        link.attr('href', entries[i].link);
        link.append(title);

        var content = $('<p>');
        content.html(entries[i].contentSnippet);
        item.append(link);
        item.append(content);
        newsList.append(item);
    }
}

function loadNews() {
    $.ajax({
        url: 'https://ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=8&q=http%3A%2F%2Fnews.google.com%2Fnews%3Foutput%3Drss&callback=displayNews',
        type: "GET",
        dataType: 'jsonp',
        jsonp: 'displayNews',
        async: 'true',
        success: function(response) {

        }
    });
}

function loadWeather(pos) {
    $.getJSON("https://api.forecast.io/forecast/c8a59ebce21645ec34d8dd31d21d15e2/" + pos.lat + "," + pos.lng + "?callback=?", function(response) {
        console.log(response);

        //add current weather
        var currentP = $("<p>");
        currentP.text(response.hourly.summary);
        $(".current-weather").append(currentP);
        currentWeatherData = response.hourly.data;

        var futureP = $("<p>");
        futureP.text(response.daily.summary);
        $(".future-weather").append(futureP);
        futureWeatherData = response.daily.data;

    })
}

function findLocation() {
    // Try HTML5 geolocation.
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            loadWeather(pos);
        }, function(error) {
            console.log(error);
        });
    } else {
        // Browser doesn't support Geolocation
        //handleLocationError(false, infoWindow, map.getCenter());
        console.log("Location Not supported by Browser");
    }
}


$(function() {
    $("#authorize").click(function() {
        handleAuthClick();
    });

    loadNews();
});
