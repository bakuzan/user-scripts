// ==UserScript==
// @name        MAL European Date Format
// @namespace   MAL
// @description DD-MM-YY date format and 24 hours time format for MAL
// @include     http://myanimelist.net/forum/*
// @include     http://myanimelist.net/panel.php
// @include     http://myanimelist.net/clubs.php*
// @include     http://myanimelist.net/profile/*
// @include     http://myanimelist.net/panel.php?go=add&selected_series_id=*
// @include     http://myanimelist.net/panel.php?go=addmanga&selected_manga_id=*
// @include     http://myanimelist.net/editlist.php?type=anime&id=*
// @include     http://myanimelist.net/panel.php?go=editmanga&id=*
// @include     http://myanimelist.net/dbchanges.php?aid=*&t=airingdates
// @include     http://myanimelist.net/dbchanges.php?mid=*&t=pubdates
// @include     http://myanimelist.net/panel.php?go=anime_series&do=add
// @include     http://myanimelist.net/panel.php?go=mangadb&do=add
// @include     http://myanimelist.net/people*
// @include     http://myanimelist.net/myfriends.php*
// @include     http://myanimelist.net/anime/*
// @include     http://myanimelist.net/manga/*
// @include     http://myanimelist.net/comtocom.php?id1=*
// @include     http://myanimelist.net/mymessages.php*
// @include     http://myanimelist.net/reviews.php*
// @include     http://myanimelist.net/recommendations.php*
// @include     http://myanimelist.net/blog*
// @include     http://myanimelist.net/history/*
// @include     http://myanimelist.net/comments.php?id=*
// @include     http://myanimelist.net/animelist/*
// @include     http://myanimelist.net/editprofile.php
// @include     http://myanimelist.net/myblog.php?go=edit
// @include     http://myanimelist.net/profile.php?username=*
// @include     http://myanimelist.net/anime.php?id=*
// @include     http://myanimelist.net/manga.php?id=*
// @include     http://myanimelist.net/ajaxtb.php?keepThis=true&detailedaid=*&TB_iframe=true&height=420&width=390
// @include     http://myanimelist.net/ajaxtb.php?keepThis=true&detailedmid=*&TB_iframe=true&height=420&width=390
// @include     http://myanimelist.net/manga.php?q=*
// @include     http://myanimelist.net/anime.php?q=*
// @include     http://myanimelist.net/anime.php
// @include     http://myanimelist.net/manga.php
// @include     http://myanimelist.net/ownlist/anime/*
// @include     http://myanimelist.net/ownlist/manga/*
// @include     http://myanimelist.net/panel.php?go=add
// @include     http://myanimelist.net/
// @version     1.4.6
// ==/UserScript==

function xpath(query, object) {
    if(!object) var object = document;
    return document.evaluate(query, object, null, XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE, null);
}

var allConverted = [];
var allView = xpath("//a[@title='View More Information']");
for (var i = 0; i < allView.snapshotLength; i++) {
    (function(ind){allView.snapshotItem(ind).addEventListener("click", function(){
        var viewID = (this.id).substring(5);
        if (allConverted.indexOf(viewID) == -1) {
            var viewMore =  setInterval(function(){
                if (convertMore(viewID)) {
                    clearInterval(viewMore);
                }
            }, 100);
        }
    }, true);})(i);
}

allElements = document.getElementsByClassName('forum_boardrow2');
if (allElements.length == 0) {
    allElements = xpath("//div[@class='spaceit'][2]/text()[preceding-sibling::br or following-sibling::a[not(@rel)] or following-sibling::br]");
}
if (allElements.snapshotLength > 0) {
    convertDates(0);
} else {
    allElements = xpath("//div[@style='padding-left: 3px;'] | //div[@class='lightLink'] | //span[@class='lightLink'] | //span[@style = 'font-weight: normal;'] | //td[@class='lightLink'][@width='110']/following-sibling::td | //td[contains(@class,'forum_boardrow')][@nowrap=''] | //div[@class='mym_user'] | //div[@width='90'][@valign='top'][@nowrap=''] | //div[@class='spaceit'] | //div[@class='lightLink spaceit'] | //span[@class='lightLink to-left'] | //div[@class='normal_header'][@style='font-size: 14px;'] | //td[@class='borderClass'][@align='right'] | //div[@class='friendBlock']/div[3] | //div[@class='friendBlock']/div[4] | //div[@style='margin-top: 8px;']/em | //td[@nowrap=''][@valign='top'][@width='90'] | //td[@class='borderClass'][4] | //table[@cellpadding='0']//td[@class='borderClass'][@valign='top'][not(@style)] | //td[@class='borderClass bgColor1'][@align='center'] | //td[@class='borderClass bgColor2'][@align='center'] | //td[@class='borderClass bgColor'][@align='center'] | //span[@class='user-status-data di-ib fl-r'] | //span[@class='fl-r fn-grey2'] | //table[@class='table-recently-updated']/tbody/tr/td[last()] | //td[@class='ac'] | //span[@class='date di-ib pt4 fs10 fn-grey4'] | //span[@class='information di-ib fs10 fn-grey4'] | //td[@class='last-post'] | //p[@class='lightLink'] | //div[@class='spaceit lightLink'] | //p[@class='info pr8']");
    convertDates(1);
}

allElements = xpath("//td[@class='borderClass']/span | //td[@class='borderClass'][6] | //div[contains(@id,'eprow')][@class='spaceit_pad'] | //div[contains(@id,'chaprow')][@class='spaceit_pad']");
if (allElements.snapshotLength > 0) {
    convertDates(2);
}

allElements = xpath("//select[@class='inputtext'][@name='timezone']/following-sibling::small");
if (allElements.snapshotLength > 0) {
    convertDates(3);
}

function convertDates(formatType) {
    for (var i = 0; i < allElements.snapshotLength; i++) {
        var dateTime = allElements.snapshotItem(i).innerHTML;
        if (formatType <= 1) {
            if (formatType == 0) {
                var dateTime = allElements.snapshotItem(i).textContent;
            }
            var dateRegex = /\d\d-(\d\d|\?)-\d\d/;
            var timeRegex = /\d{1,2}:\d\d [AP]M/;
            var date = "" + dateRegex.exec(dateTime);
            if (dateRegex.exec(dateTime)) {
                date = "" + dateRegex.exec(dateTime)[0];
            }
            var time = "" + timeRegex.exec(dateTime);
        }
        if (formatType == 2) {
            var dateRegex = /\d{1,2}\/\d{1,2}\/\d\d/;
            var date = "" + dateRegex.exec(dateTime);
            var time = allElements.snapshotItem(i).title;
        }
        if (formatType == 3) {
            var time = dateTime.substring(6);
        }
        if (formatType <= 1) {
            var month = date.substring(0, 2);
            if (date.length == 8) {
                var day = date.substring(3, 5);
                var year = date.substring(6, 8);
            } else {
                var day = date.substring(3, 4);
                var year = date.substring(5, 7);
            }
            if (time.length == 7) {
                var hour = Number(time.substring(0, 1));
                var minute = time.substring(2, 4);
                var dayNight = time.substring(5);
            } else {
                var hour = Number(time.substring(0, 2));
                var minute = time.substring(3, 5);
                var dayNight = time.substring(6);
            }
        } else {
            if (time.length == 6) {
                var hour = Number(time.substring(0, 1));
                var minute = time.substring(2, 4);
                var dayNight = time.substring(4);
            } else {
                var hour = Number(time.substring(0, 2));
                var minute = time.substring(3, 5);
                var dayNight = time.substring(5);
            }
        }
        if (formatType == 2) {
            var month = date.split('\/')[0];
            var day = date.split('\/')[1];
            if ( month.length == 1 ) {
                month = '0' + month;
            }
            if ( day != undefined && day.length == 1 ) {
                day = '0' + day;
            }
        }
        if ( (dayNight == "PM" || dayNight == "pm") && hour < 12 ) {
            hour = hour + 12;
        }
        if ( (dayNight == "AM" || dayNight == "am") && hour == 12) {
            hour = hour - 12;
        }
        if (hour < 10) {
            hour = '0' + hour;
        }
        if (formatType <= 1) {
            dateTime = dateTime.replace(date, day + '-' + month + '-' + year);
            dateTime = dateTime.replace(time, hour + ':' + minute);
            if (formatType == 0) {
                allElements.snapshotItem(i).textContent = dateTime;
            } else {
                allElements.snapshotItem(i).innerHTML = dateTime;
            }
        }
        if (formatType == 2 && date != null) {
            dateTime = dateTime.replace(date, day + '.' + month + '.' + date.split('\/')[2]);
            if (time) {
                 dateTime = dateTime + ', ' + hour + ':' + minute;
            }
            allElements.snapshotItem(i).innerHTML = dateTime;
        }
        if (formatType == 3) {
            dateTime = dateTime.replace(time, hour + ':' + minute);
            allElements.snapshotItem(i).innerHTML = dateTime;
        }
    }
}

function convertMore(IDnumber) {
    allElements = xpath("//td[ancestor::div[@id='more" + IDnumber + "']]");
    if (allElements.snapshotLength == 1) {
        if (allConverted.indexOf(IDnumber) == -1) {
            convertDates(1);
            allConverted.push(IDnumber);
            allElements.snapshotItem(0).firstChild.classList.add('datemodified');
            return true;
        }
        if (!allElements.snapshotItem(0).firstChild.classList.contains('datemodified')) {
            convertDates(1);
            allElements.snapshotItem(0).firstChild.classList.add('datemodified');
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

if ( xpath("//select[@id[contains(.,'start_date_day')]]").snapshotLength > 0 ) {
    startDate = xpath("//select[@id[contains(.,'start_date_day')]]").snapshotItem(0).parentNode.innerHTML;
    endDate = xpath("//select[@id[contains(.,'finish_date_day')]]").snapshotItem(0).parentNode.innerHTML;

    startDate = startDate.replace("Month", "temp");
    startDate = startDate.replace("Day", "Month");
    startDate = startDate.replace("temp", "Day");
    endDate = endDate.replace("Month", "temp");
    endDate = endDate.replace("Day", "Month");
    endDate = endDate.replace("temp", "Day");

    xpath("//select[@id[contains(.,'start_date_day')]]").snapshotItem(0).parentNode.innerHTML = startDate;
    xpath("//select[@id[contains(.,'finish_date_day')]]").snapshotItem(0).parentNode.innerHTML = endDate;

    replaceSelects("id[contains(.,'start_date_day')]", "id[contains(.,'start_date_month')]", "id[contains(.,'finish_date_day')]", "id[contains(.,'finish_date_month')]");
}

if ( xpath("//select[@name='series_start_day']").snapshotLength > 0 ) {
    xpath("//select[@name='series_start_year']/following-sibling::small").snapshotItem(0).innerHTML = 'dd-mm-yyyy';
    xpath("//select[@name='series_end_year']/following-sibling::small").snapshotItem(0).innerHTML = 'dd-mm-yyyy';
    if ( xpath("//select[@name='series_start_year']/following-sibling::small").snapshotLength > 1 ) {
        xpath("//select[@name='series_start_year']/following-sibling::small").snapshotItem(1).innerHTML = 'Note: You\'re using "MAL European Date Format" userscript which converts dates to EUROPEAN format (dd-mm-yyyy), the same one AniDB uses. Do NOT convert dates to America (mm-dd-yyyy)!';
    }

    replaceSelects("name='series_start_day'", "name='series_start_month'", "name='series_end_day'", "name='series_end_month'");
}

if ( xpath("//select[@name='manga_start_day']").snapshotLength > 0 ) {
    xpath("//select[@name='manga_start_year']/following-sibling::small").snapshotItem(0).innerHTML = 'dd-mm-yyyy';
    xpath("//select[@name='manga_end_year']/following-sibling::small").snapshotItem(0).innerHTML = 'dd-mm-yyyy';

    replaceSelects("name='manga_start_day'", "name='manga_start_month'", "name='manga_end_day'", "name='manga_end_month'");
}

if ( xpath("//select[@name='bday']").snapshotLength > 0 ) {
    xpath("//select[@name='byear']/following-sibling::small").snapshotItem(0).innerHTML = 'dd-mm-yyyy';

    replaceSelects("name='bday'", "name='bmonth'", null, null);
}

if ( xpath("//div[@id='episode_submission_aired_date']").snapshotLength > 0 ) {
    replaceSelects("id='episode_submission_aired_date_month'", "id='episode_submission_aired_date_day'", null, null);
}

if ( xpath("//select[@name='sd']").snapshotLength > 0 ) {
    xpath("//select[@name='sy']/following-sibling::small").snapshotItem(0).innerHTML = 'dd-mm-yyyy';
    xpath("//select[@name='ey']/following-sibling::small").snapshotItem(0).innerHTML = 'dd-mm-yyyy';

    replaceSelects("name='sd'", "name='sm'", "name='ed'", "name='em'");
}

function replaceSelects(startDay, startMonth, endDay, endMonth) {
    startDay = xpath("//select[@"+startDay+"]").snapshotItem(0);
    startMonth = xpath("//select[@"+startMonth+"]").snapshotItem(0);
    endDay = xpath("//select[@"+endDay+"]").snapshotItem(0);
    endMonth = xpath("//select[@"+endMonth+"]").snapshotItem(0);

    var tempNode = startMonth.cloneNode();
    startDay.parentNode.insertBefore(tempNode,startDay);
    startDay.parentNode.insertBefore(startDay,startMonth);
    startMonth.parentNode.insertBefore(startMonth,tempNode);
    startMonth.parentNode.removeChild(tempNode);
    tempNode = endMonth.cloneNode();
    endDay.parentNode.insertBefore(tempNode,endDay);
    endDay.parentNode.insertBefore(endDay,endMonth);
    endMonth.parentNode.insertBefore(endMonth,tempNode);
    endMonth.parentNode.removeChild(tempNode);
}