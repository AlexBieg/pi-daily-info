// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '492257460870-9hevog7tfv04aqtmflp58eu2th5vst0o.apps.googleusercontent.com';

var SCOPES = ["https://www.googleapis.com/auth/calendar.readonly"];

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
      loadCalendarApi();
    } else {
      // Show auth UI, allowing the user to initiate authorization by
      // clicking authorize button.
      authorizeBtn.show();
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
function loadCalendarApi() {
    gapi.client.load('calendar', 'v3', listUpcomingEvents);
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
          append(event.summary + ' (' + when + ')')
        }
      } else {
        append('No upcoming events found.');
      }

    });
}

/**
* Append a pre element to the body containing the given message
* as its text node.
*
* @param {string} message Text to be placed in pre element.
*/
function append(message) {
    var list = $('.response');
    var item = $('<li>');
    item.text(message);
    list.append(item);
}


$(function() {
    $("#authorize").click(function() {
        handleAuthClick();
    });
});
