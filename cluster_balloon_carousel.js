ymaps.ready(function() {
    var mapCenter = [55.755381, 37.619044],
        map = new ymaps.Map('map', {
            center: mapCenter,
            zoom: 9,
            controls: []
        }),
        coords,
        placemarks = [],
        points = [],
        pointId = 0;

    // Создаем собственный макет с информацией о выбранном геообъекте.
    var customItemContentLayout = ymaps.templateLayoutFactory.createClass(
        // Флаг "raw" означает, что данные вставляют "как есть" без экранирования html.
        '<h2 class=ballon_header>{{ properties.balloonContentHeader|raw }}</h2>' +
        '<div class=ballon_body>{{ properties.balloonContentBody|raw }}</div>' +
        '<div class=ballon_footer>{{ properties.balloonContentFooter|raw }}</div>'
    );

    var clusterer = new ymaps.Clusterer({
        clusterDisableClickZoom: true,
        clusterOpenBalloonOnClick: true,
        // Устанавливаем стандартный макет балуна кластера "Карусель".
        clusterBalloonContentLayout: 'cluster#balloonCarousel',
        // Устанавливаем собственный макет.
        clusterBalloonItemContentLayout: customItemContentLayout,
        // Устанавливаем режим открытия балуна. 
        // В данном примере балун никогда не будет открываться в режиме панели.
        clusterBalloonPanelMaxMapArea: 0,
        // Устанавливаем размеры макета контента балуна (в пикселях).
        clusterBalloonContentLayoutWidth: 200,
        clusterBalloonContentLayoutHeight: 130,
        // Устанавливаем максимальное количество элементов в нижней панели на одной странице
        clusterBalloonPagerSize: 5

    });

    var link = document.querySelector('#map');
    var popup = document.getElementById('popup');
    var add = document.getElementById('add');
    var headerText = document.getElementById('header-text');

    map.events.add('click', function(e) {
        if (!map.balloon.isOpen()) {
            e.preventDefault();
            pointId++;
            coords = e.get('coords');
            clientPixels = e.get('clientPixels');
            popup.style.left = clientPixels[0] + 'px';
            popup.style.top = clientPixels[1] + 'px';
            ymaps.geocode(coords, { kind: 'street' }).then(function(res) {
                var nearestStreet = res.geoObjects.get(0);
                headerText.innerText = `${nearestStreet.properties.get('description')}, ${nearestStreet.properties.get('name')}`;
                popup.style.display = 'block';
            });
        } else {
            map.balloon.close();
        }
    });

    link.addEventListener('click', function(e) {
        if (!e.target.dataset.id) {
            return;
        }
        debugger;

    });

    add.addEventListener('click', function(e) {
        var point = {
            userName: document.getElementById('feedback-name').value,
            place: document.getElementById('feedback-place').value,
            streatName: headerText.innerText,
            feedback: document.getElementById('feedback-textarea').value,
            date: new Date()
        }
        var placemark = new ymaps.Placemark(coords, {
            balloonContentHeader: point.place,
            balloonContentBody: `<p><a href="#" data-id="${point.id}" >${point.streatName}</a></p> 
                                 <p>${point.feedback}</p>`,
            balloonContentFooter: point.date.toLocaleString("ru")
        });
        placemarks.push(placemark);
        points.push(point);
        clusterer.add(placemarks);
        map.geoObjects.add(clusterer);
        //placemarks[3].geometry.getCoordinates()
        debugger;
        sessionStorage.setItem(pointId, JSON.stringify(points));
    });

    document.getElementById('hider').onclick = function() {
        document.getElementById('popup').style.display = 'none';
    }

    function getLastId() {
        return 0;
    }



    clusterer.balloon.open(clusterer.getClusters()[0]);
});