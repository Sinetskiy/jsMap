var feedbacksTemplate = require('../feedbacks-template.hbs');

ymaps.ready(function() {
    var mapCenter = [55.755381, 37.619044],
        map = new ymaps.Map('map', {
            center: mapCenter,
            zoom: 9,
            controls: []
        }),
        coords,
        placemarks = [],
        points = JSON.parse(localStorage.getItem('placemarks')) || [],
        feedbackWrap = document.getElementById('feedback-wrap'),
        popup = document.getElementById('popup'),
        add = document.getElementById('add'),
        headerText = document.getElementById('header-text'),
        link = document.getElementById('map'),
        formHider = document.getElementById('hider'),
        feedbackName = document.getElementById('feedback-name'),
        feedbackPlace = document.getElementById('feedback-place'),
        feedbackTextarea = document.getElementById('feedback-textarea');

    var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
        '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
        '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );

    var clusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        clusterBalloonItemContentLayout: customItemContentLayout,
        clusterBalloonPanelMaxMapArea: 0,
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        clusterBalloonPagerSize: 9

    });

    map.events.add('click', function(e) {

        e.preventDefault();
        map.balloon.close();
        clearFeedbackForms();
        var clientPixels = e.get('clientPixels');
        popup.style.left = clientPixels[0] + 'px';
        popup.style.top = clientPixels[1] + 'px';
        coords = e.get('coords');
        ymaps.geocode(coords, { kind: 'street' }).then(function(res) {
            var nearestStreet = res.geoObjects.get(0);
            headerText.innerText = `${nearestStreet.properties.get('description')}, ${nearestStreet.properties.get('name')}`;
            popup.style.display = 'block';
        });

    });

    add.addEventListener('click', function(e) {
        if (!coords) {
            return;
        }
        var point = {
            coords: coords,
            userName: feedbackName.value,
            place: feedbackPlace.value,
            streatName: headerText.innerText,
            feedback: document.getElementById('feedback-textarea').value,
            date: (new Date()).toLocaleString("ru")
        }
        points.push(point);
        debugger;
        localStorage.setItem('placemarks', JSON.stringify(points));

        addPointToMap(point);
        var feedbacks = getPointsByCoord(point.coords);
        clearFeedbackForms();
        feedbackWrap.innerHTML = createFeedbacks(feedbacks);
    });

    link.addEventListener('click', function(e) {
        popup.style.display = 'none';
        var datasetCoords = e.target.dataset.coords;
        if (!datasetCoords) {
            return;
        }
        map.balloon.close();
        clearFeedbackForms();
        debugger;
        coords = datasetCoords.split(';');
        var feedbacks = getPointsByCoord(coords);

        feedbackWrap.innerHTML = createFeedbacks(feedbacks);
        popup.style.left = e.pageX + 'px';
        popup.style.top = e.pageY + 'px';
        headerText.innerText = feedbacks[0].streatName;
        popup.style.display = 'block';

    });

    function getPointsByCoord(coords) {
        return points.filter(v => v.coords[0] == coords[0] && v.coords[1] == coords[1]);
    }

    function addPointToMap(point) {

        var placemark = new ymaps.Placemark(point.coords, {
            balloonContentHeader: point.place,
            balloonContentBody: `<p><a href="#" data-coords="${point.coords[0]};${point.coords[1]}" >${point.streatName}</a></p> 
                                 <p>${point.feedback}</p>`,
            balloonContentFooter: point.date
        });
        placemarks.push(placemark);
        clusterer.add(placemarks);
        map.geoObjects.add(clusterer);
    }

    function createFeedbacks(feedbacks) {
        return feedbacksTemplate({
            feedbacks: feedbacks
        });
    }

    function clearFeedbackForms() {
        feedbackWrap.innerHTML = createFeedbacks([]);
        feedbackName.value = "";
        feedbackPlace.value = "";
        feedbackTextarea.value = "";
    }

    formHider.onclick = function() {
        document.getElementById('popup').style.display = 'none';
    }

    if (points.length > 0) {
        for (let point of points) {
            addPointToMap(point);
        }
    }

});