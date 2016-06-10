// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '492257460870-9hevog7tfv04aqtmflp58eu2th5vst0o.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly", "https://www.googleapis.com/auth/gmail.readonly"];

/**
* Check if current user has authorized this application.
*/
function checkAuth() {
    gapi.auth.authorize(
      {
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
    gapi.auth.authorize(
      {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
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
                'id' : messages[i].id
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
            if (whenDate.getHours() > 12){
                formattedHours = whenDate.getHours() - 12;
                if (whenDate.getHours() != 24 || whenDate.getHours() != 0 || whenDate.getHours() == 12) {
                    dayPeriod = "PM"
                }
            }
            var formattedMinutes = whenDate.getMinutes()+"";
            if (formattedMinutes.length < 2) {
                formattedMinutes = "0" + formattedMinutes;
            }
            var formatedTime = formattedHours + ":" + formattedMinutes + " " + dayPeriod;
            appendEvent(formatedTime + ': ' + event.summary, event.htmlLink);
        }
      } else {
        appendEvent('No upcoming events found.', '#');
      }

    });
}

/**
* Append a pre element to the body containing the given message
* as its text node.
*
* @param {string} message Text to be placed in pre element.
*/
function appendEvent(message, link) {
    var list = $('.event-list');
    var item = $('<li>');
    var linkTag = $('<a>');
    var text = $('<h3>');
    text.text(message);
    linkTag.attr('href', link);
    linkTag.append(text);
    item.append(linkTag);
    list.append(item);
}

function loadNews() {
  //   $.ajax({
  //   url: "https://news.google.com/news?cf=all&hl=en&pz=1&ned=us&topic=tc&output=rss",
  //   jsonp: "callback",
  //
  //   // tell jQuery we're expecting JSONP
  //   dataType: "jsonp",
  //   success: function( response ) {
  //     console.log(response);
  //   }
  // });
}

function loadWeather() {
    
}


$(function() {
    $("#authorize").click(function() {
        handleAuthClick();
    });

    loadNews();
    loadWeather();
});
