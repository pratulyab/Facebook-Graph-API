var fbGroupLinks = (function () {
    "use strict";
    var useridURL = "https://graph.facebook.com/v2.3/me/",
        groupidURL = "https://graph.facebook.com/v2.3/me/groups/",
        groupfeedURL = "https://graph.facebook.com/v2.3/",
        containerEl,
        groupIdInProcess = false,
        userIdInProcess = false;
    
    function sendRequest(url, data, onsuccess, onerror) {
        $.ajax({
            url: url,
            data: data,
            type: 'GET',
            responseType: 'json',
            success: function (data, status, xhr) {
                onsuccess(data);
            },
            error: function (xhr, status, error) {
                onerror(error);
            }
        });
    }
    
    function displayError(form, msg){
        if (msg === undefined)
            msg="Error Occurred. Maybe the token has expired. Try generating new one. Also, check permissions.";
        var small = $('<small/>');
        small.addClass('error red-text col s12 m8 offset-m2');
        small.html(msg);
        $(form).parent().prepend(small);
    }
    
    function getFeedLinks(access_token, e){
        e.preventDefault();
        var form = $(this),
            group_id = form.data('id'),
            tempu, tempd,
            uploader = (tempu = form.find('.uploader-name-input').val().toLowerCase()) ? tempu : '',
            date = (tempd = form.find('.date-input').val()) ? tempd : (new Date(2004,1,4)),
            data = {'access_token': access_token, 'limit': 5000},
            url = groupfeedURL + group_id + '/feed/',
            url_regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g,
            textcolors = ["light-blue-text text-lighten-4", "teal-text", "red-text text-lighten-3"],
            chooser = 1,
            onsuccess = function(data){
                data = data.data;
                var div = $('<div id="messages" class="row col s12"/>');
                for (var post of data){
                    if (post.created_time < date || post.from.name.toLowerCase().search(uploader) === -1 || !post.message)
                        continue;
                    
                    // Extracting links from posts
                    var match = url_regex.exec(post.message),
                        links = [];
                    while (match != null){
                        links.push(match[0]);
                        match = url_regex.exec(post.message);
                    }
                    if (links.length){
                        var msg = $('<div class="card blue-grey darken-3 message col s12 m8 offset-m2"/>');
                        var content = $('<div class="card-content"/>');
                        content.addClass(textcolors[chooser++ % textcolors.length]);
                        var span = $('<span class="card-title"/>'); span.html('<b>' + post.from.name + ' on ' + new Date(post.created_time).toDateString() + '</b>');
                        var p = $('<p/>'); p.html(post.message);
                        var action = $('<div class="card-action"/>');
                        for (var i=0; i<links.length; i++){
                            var a = $('<a class="tooltipped"/>');
                            a.attr('href', links[i]);
                            a.attr('target', '_blank');
                            a.attr('data-tooltip', links[i]);
                            a.attr('data-delay', 0);
                            a.html('<i class="fa fa-external-link-square"/>');
                            action.append(a);
                        }
                        content.append(span); content.append(p); content.append(action); msg.append(content); div.append(msg);
                    }
                }
                if (!div.children().length){
                    var p = $('<p class="red-text text-lighten-2 center-align"/>');
                    p.html("<b>Sorry, couldn't find relevant posts. Try changing filters or group.</b>");
                    containerEl.addClass('flow-text');
                    containerEl.html(p);
                }
                else{
                    containerEl.html(div);
                    containerEl.addClass('blue-grey lighten-4');
                    containerEl.find('a.tooltipped').tooltip();
                }
            },
            onerror = function(error){
                var p = $('<p class="red-text text-lighten-2 center-align"/>');
                p.html("<b>Sorry, couldn't retrieve the group messages. Maybe the token has expired. Please try again.</b>");
                containerEl.addClass('flow-text');
                containerEl.html(p);
            };
        containerEl.html('<div class="preloader col s12 center"><div class="preloader-wrapper big active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>');
        window.scrollTo(0,0);
        containerEl.removeClass('flow-text');
        sendRequest(url, data, onsuccess, onerror);
    }
    
    function renderGroups(form, access_token, user_id) {
        var data = {'access_token': access_token},
            parentDiv = $('.preloader').parent(), //form.parent() won't work because the form has been replaced
            onsuccess = function (data) {
                data = data.data;
                var ul = $('<ul class="collapsible" data-collapsible="accordion"/>'),
                    group_form = $('<form class="group-form col s12"/>'),
                    name_input = $('<p><b>Uploader\'s Name (Optional)</b></p><input type="text" class="uploader-name-input col s12" placeholder="Enter the name of the person, the links by whom you\'d like to retrieve. If left blank, links by every one will be retrieved, if any.">'),
                    date_input = $('<p><b>Date (Optional)</b></p><input type="date" class="date-input col s12" placeholder="To filter out the links in group feed after a particular date." id="date-input">'),
                    button = $('<button type="submit" class="waves-effect waves-light light-blue btn col s12 m8 offset-m2"/>');
                button.html('Get Links&nbsp;<i class="fa fa-link"></i>');
                group_form.append(name_input);
                group_form.append(date_input);
                group_form.append(button);
                for (var group of data){
                    var li = $('<li class="row"/>'),
                        header = $('<div class="collapsible-header center-align"/>'),
                        body = $('<div class="collapsible-body"/>');
                    header.html(group.name);
                    var group_form_clone = group_form.clone();
                    group_form_clone.attr('data-id', group.id);
                    body.html(group_form_clone);
                    li.append(header);
                    li.append(body);
                    ul.append(li);
                }
                ul.find('div.collapsible-header').first().addClass('active'); // Adding 'active' class to the header of the first li
                parentDiv.html(ul); // Registering the ul element in the DOM
                ul.collapsible(); // Initialising the Materialize accordion
                $('.date-input').pickadate({
                    selectMonths: true,
                    min: new Date(2004,1,4),
                    max: new Date(),
                    selectYears: 15
                }); // Initialising Materialize datepicker (docs at amsul.ca)
                
                // Concept
                $('.group-form').each(function(i, el){
                   $(el).on('submit', getFeedLinks.bind(el, access_token)); 
                });
            },
            onerror = function(error){
                parentDiv.html(form);
                displayError(form);
                form.on('submit', getGroups);
            };
        sendRequest(groupidURL, data, onsuccess, onerror);
    }
    
    function getUserId(form, access_token){
        form = $(form);
        var data = {'access_token': access_token},
            parentDiv = form.parent(),
            onsuccess = function(data){
                // Get the user's groups
                var user_id = data.id;
                renderGroups(form, access_token, user_id);
            },
            onerror = function(error){
                parentDiv.html(form);
                displayError(form);
                form.on('submit', getGroups);
            };
        // Circular Preloader
        parentDiv.html('<div class="preloader col s12 center"><div class="preloader-wrapper big active"><div class="spinner-layer spinner-blue-only"><div class="circle-clipper left"><div class="circle"></div></div><div class="gap-patch"><div class="circle"></div></div><div class="circle-clipper right"><div class="circle"></div></div></div></div></div>');
        sendRequest(useridURL, data, onsuccess, onerror);
    }
    
    function getGroups(e) {
        var form = $(this);
        e.preventDefault();
        form.parent().find('small').remove();
        //var at_input = $('access-token-input');
        var at_input = form.find('input');
        var access_token = at_input.val();
        if (!access_token){
            displayError(this, 'Access Token is required.');
            at_input.addClass('invalid');
            return;
        }
        var user_id = getUserId(this, access_token);
    }
    
    return {
      init: function() {
          containerEl = $('#links-container');
          if (!containerEl.length){
              console.log('Html div container\'s id has been changed. Please reset it to "container"');
              return;
          }
          var form = $('#access-token-form');
          if (!form.length){
              console.log('Form with access token input not found.');
              return;
          }
          
          form.on('submit', getGroups);
      }  
    };
    
}) ();