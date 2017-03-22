ymaps.ready(function() {
    var mapCenter = [55.755381, 37.619044],
        map = new ymaps.Map('map', {
            center: mapCenter,
            zoom: 9,
            controls: []
        }),
        coords;

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
            // Настройка внешего вида нижней панели.
            // Режим marker рекомендуется использовать с небольшим количеством элементов.
            // clusterBalloonPagerType: 'marker',
            // Можно отключить зацикливание списка при навигации при помощи боковых стрелок.
            // clusterBalloonCycling: false,
            // Можно отключить отображение меню навигации.
            // clusterBalloonPagerVisible: false
    });

    var link = document.querySelector('#map');
    var popup = document.getElementById('popup');
    var add = document.getElementById('add');
    var headerText = document.getElementById('header-text');

    map.events.add('click', function(e) {
        if (!map.balloon.isOpen()) {
            e.preventDefault();
            coords = e.get('coords');
            clientPixels = e.get('clientPixels');
            popup.style.left = clientPixels[0] - popup.offsetWidth + 'px';
            popup.style.top = clientPixels[1] + 'px';
            ymaps.geocode(e.get('coords'), { kind: 'street' }).then(function(res) {
                var nearestStreet = res.geoObjects.get(0);
                headerText.innerText = `${nearestStreet.properties.get('description')}, ${nearestStreet.properties.get('name')}`;
                popup.style.display = 'block';
            });
        } else {
            map.balloon.close();
        }
    });

    add.addEventListener('click', function(e) {
        var placemarks = [];
        var placemark = new ymaps.Placemark(coords, {
            // Устаналиваем данные, которые будут отображаться в балуне.
            //   balloonContentHeader: document.getElementById('feedback-name').value,
            balloonContentHeader: document.getElementById('feedback-place').value,
            balloonContentBody: `<p>${headerText.innerText}</p> 
                                 <p>${document.getElementById('feedback-textarea').value}</p>`,
            balloonContentFooter: (new Date()).toLocaleString("ru")
        });
        placemarks.push(placemark);

        clusterer.add(placemarks);

        map.geoObjects.add(clusterer);
    });

    document.getElementById('hider').onclick = function() {
        document.getElementById('popup').style.display = 'none';
    }

    function getRandomPosition() {
        return [
            mapCenter[0] + (Math.random() * 0.3 - 0.15),
            mapCenter[1] + (Math.random() * 0.5 - 0.25)
        ];
    }

    clusterer.balloon.open(clusterer.getClusters()[0]);
});