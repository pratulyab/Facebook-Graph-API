var fbPhotos = (function () {
    "use strict";
    
    var baseURL = "https://graph.facebook.com/v2.3/me/photos/uploaded/",
        prevURL, nextURL,
        accessToken,
        containerEl,
        imgWidth,
        inProcess = false;
    
    function render(response) {
        var list = response.data;
        var carousel = $('<div class="carousel"/>');
        // To extract the photo src with width closes to imgWidth, the one with least margin diff is chosen, higher priority to width greater considering difference.
        for (var i=0;i<list.length;i++){
            var image_el = $('<img>'),
                index,
                flag = 0,
                min = 10000,min_index,
                max = 0,max_index,
                margin = new Array;
            
            margin = [0,20,50,80,100];
            
            while ( margin[0] !== undefined ){
                
                for(index = 0; index < list[i].images.length; index++){
                    if ( ( list[i].images[index].width < imgWidth+margin[0] ) && ( list[i].images[index].width > imgWidth-margin[0] ) ) {
                        flag = 1;
                        break;
                    }
                    if (list[i].images[index].width < min){
                        min = list[i].images[index].width;
                        min_index = index;
                    }
                    if (list[i].images[index].width > max){
                        max = list[i].images[index].width;   
                        max_index = index;
                    }
                }
                if(flag === 1){
                    break;
                }
                margin.shift();
            } // end of while
            
            if( flag === 0){
                if (imgWidth < min){
                    index = min_index;
                }
                if (imgWidth > max){
                    index = max_index;
                }
            }
            
            var final = list[i].images[index];
            image_el.attr('src', final.source);
            //image_el.addClass('materialboxed');
            var a = $('<a class="carousel-item"/>');
            a.html(image_el);
            carousel.append(a);
        } // end of 'for' loop
        containerEl.append(carousel);
        prevURL = response.paging.previous || null;
        nextURL = response.paging.next || null;
        inProcess = false;
    }
    
    function getPhotos(url) {
        if (!url){
            console.log("url is null");
            return;
        }
        inProcess = true;
        containerEl.html('<div class="row"><div class="col s8 offset-s2"><div class="progress"><div class="indeterminate"></div></div></div></div>');
        $.ajax({
            url: url,
            data: {'access_token': accessToken},
            async: true,
            type: 'GET',
            contentType: 'json',
            success: function(data, status, xhr){
                containerEl.empty();
                $('#arrows').remove();
                render(data);
                drawArrows();
                $('.carousel').carousel();
                $('.tooltipped').tooltip();
            },
            error: function(xhr, status, error){
                containerEl.empty();
                displayError();
            }
        });
    }
    
    function drawArrows () {
        var arrows_div = $('<div id="arrows" class="center"/>');
        if(prevURL){
            var prev_arrow = $('<i id="prevarrow"/>');
            prev_arrow.addClass('fa fa-arrow-left fa-5x tooltipped');
            prev_arrow.attr('data-tooltip', 'Load Previous');
            prev_arrow.attr('data-position', 'left');
            prev_arrow.attr('data-delay', 0);
            arrows_div.append(prev_arrow);
            prev_arrow.hover(changeCursor);
            prev_arrow.on('click', function(e){
                e.preventDefault();
                if( inProcess === false ){   
                    getPhotos(prevURL);
                }
            });
        }
        if(nextURL){
            var next_arrow = $('<i id="nextarrow"/>');
            next_arrow.addClass('fa fa-arrow-right fa-5x tooltipped');
            // for some weird reason el.data('', '') is not working
            next_arrow.attr('data-tooltip', 'Load More');
            next_arrow.attr('data-position', 'right');
            next_arrow.attr('data-delay', 0);
            arrows_div.append(next_arrow);
            next_arrow.hover(changeCursor);
            next_arrow.on('click', function(e){
                e.preventDefault();
                if( inProcess === false ){   
                    getPhotos(nextURL);
                }
            });
        }
        containerEl.append(arrows_div);
    }
    
    function changeCursor(e){
        this.style.cursor = "pointer"
        return;
    }

    function displayError(msg = "Error Occurred. Maybe the token has expired. Try generating new one. Also, check permissions."){
        var small = $('<small/>');
        small.addClass('error red-text col s12 m8 offset-m2');
        small.html(msg);
        $('#get-photos-form > div:first').append(small);
    }
    
    return {
        init: function (config) {
            var flag = 0;
            $('#get-photos-form').on('submit', function(e){
                e.preventDefault();
                accessToken = $('#access-token-input').val();
                $('.error').remove();
                $('.tooltipped').tooltip('remove');
                if (!accessToken){
                    displayError("Please Enter Access Token");
                    return;
                }
                if (!inProcess)
                    getPhotos(baseURL);
            });
            
            if (flag === 1){
                flag = 0;
                return;
            }
            if(!config.id){
                console.log("Please Provide An ID");
                return;
            }
            containerEl = $('#'+config.id);
            
            if(!containerEl){
                console.log("Invalid ID");
                return;
            }
            imgWidth = config.img_width;
        }
    };
}) ();